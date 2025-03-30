const express = require("express");
const router = express.Router();
const { Layout, Counter } = require("../models/Layout");

// Middleware para manejo de errores centralizado
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Normalizar espacios (migración a nueva estructura)
const normalizeSpaces = (espacios) => {
  return Array.from({ length: 55 }, (_, i) => {
    const espacioId = `espacio-${i}`;
    const existing = espacios.find(e => e.id === espacioId);
    
    return {
      id: espacioId,
      mesa: existing?.mesa ? {
        ...existing.mesa,
        // Asegurar que tenga nMesa
        nMesa: existing.mesa.nMesa || (parseInt(espacioId.replace('espacio-', '')) + 1)
      } : null
    };
  });
};

// Obtener el layout actual (MEJORADO)
router.get("/", asyncHandler(async (req, res) => {
  let layout = await Layout.findOne().sort({ creadoEn: -1 }).lean();

  if (!layout) {
    // Inicializar con valores por defecto
    const espacios = Array.from({ length: 55 }, (_, i) => ({
      id: `espacio-${i}`,
      mesa: null
    }));

    layout = await Layout.create({ espacios });
    await Counter.findOneAndUpdate(
      { _id: 'mesaId' },
      { $set: { seq: 0 } },
      { upsert: true }
    );
  } else {
    // Migrar datos antiguos si es necesario
    if (!layout.version || layout.version < 2) {
      layout.espacios = normalizeSpaces(layout.espacios);
      layout.version = 2;
      layout = await Layout.findByIdAndUpdate(
        layout._id,
        { $set: { espacios: layout.espacios, version: 2 } },
        { new: true }
      );
    }
  }

  res.json(layout);
}));

// Guardar nuevo layout (MEJORADO)
router.post("/", asyncHandler(async (req, res) => {
  const espacios = normalizeSpaces(req.body.espacios || []);

  // Validar mesas
  const mesasValidas = espacios.every(espacio => {
    if (!espacio.mesa) return true;
    return (
      Number.isInteger(espacio.mesa.nMesa) &&
      espacio.mesa.nMesa >= 1 &&
      espacio.mesa.nMesa <= 55
    );
  });

  if (!mesasValidas) {
    return res.status(400).json({ error: "Números de mesa inválidos" });
  }

  const nuevoLayout = await Layout.create({ espacios, version: 2 });
  
  // Actualizar contador si hay mesas
  const maxMesa = Math.max(...espacios.map(e => e.mesa?.nMesa || 0));
  if (maxMesa > 0) {
    await Counter.findOneAndUpdate(
      { _id: 'mesaId' },
      { $set: { seq: maxMesa } },
      { upsert: true }
    );
  }

  res.status(201).json(nuevoLayout);
}));

// Actualizar layout existente (MEJORADO)
router.put("/:id", asyncHandler(async (req, res) => {
  const espacios = normalizeSpaces(req.body.espacios || []);

  const updated = await Layout.findByIdAndUpdate(
    req.params.id,
    { $set: { espacios, version: 2 } },
    { 
      new: true,
      runValidators: true,
      context: 'query'
    }
  );

  if (!updated) {
    return res.status(404).json({ error: "Layout no encontrado" });
  }

  res.json(updated);
}));

// Middleware para errores
router.use((err, req, res, next) => {
  console.error("Error en routes/layout:", err);
  res.status(500).json({ 
    error: "Error interno del servidor",
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

module.exports = router;