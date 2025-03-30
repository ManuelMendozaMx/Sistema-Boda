const express = require("express");
const router = express.Router();
const Layout = require("../models/Layout");



// Obtener el layout actual
router.get("/", async (req, res) => {
  try {
    const layout = await Layout.findOne().sort({ creadoEn: -1 });
    if (!layout) {
      // Si no existe, crear uno nuevo
      const nuevosEspacios = Array.from({ length: 55 }, (_, i) => ({
        id: `espacio-${i}`,
        mesa: null
      }));
      const nuevoLayout = await Layout.create({ espacios: nuevosEspacios });
      return res.json(nuevoLayout);
    }
    res.json(layout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Guardar nuevo layout
router.post("/", async (req, res) => {
  try {
    // Aseguramos que siempre haya 55 espacios
    const espacios = req.body.espacios?.length === 55 
      ? req.body.espacios 
      : Array.from({ length: 55 }, (_, i) => ({
          id: `espacio-${i}`,
          mesa: null
        }));

    const nuevoLayout = await Layout.create({ espacios });
    res.status(201).json(nuevoLayout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Actualizar layout existente (PUT)
router.put("/:id", async (req, res) => {
  try {
    const updated = await Layout.findByIdAndUpdate(
      req.params.id,
      { espacios: req.body.espacios },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;