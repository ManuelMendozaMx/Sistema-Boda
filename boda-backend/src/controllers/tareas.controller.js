const Tarea = require('../models/Tarea');

// Obtener todas las tareas con filtros avanzados
exports.getTareas = async (req, res) => {
  try {
    const { 
      estado, 
      prioridad, 
      categoria, 
      equipo, 
      fechaDesde, 
      fechaHasta,
      completadas
    } = req.query;
    
    const filters = {};
    
    if (estado) filters.estado = estado;
    if (prioridad) filters.prioridad = prioridad;
    if (categoria) filters.categoria = categoria;
    if (equipo) filters.equipo = equipo;
    if (completadas && !estado) filters.estado = 'completada';
    
    if (fechaDesde || fechaHasta) {
      filters.fechaLimite = {};
      if (fechaDesde) filters.fechaLimite.$gte = new Date(fechaDesde);
      if (fechaHasta) filters.fechaLimite.$lte = new Date(fechaHasta);
    }
    
    const tareas = await Tarea.find(filters)
      .sort({ prioridad: -1, fechaLimite: 1 });
    
    res.status(200).json(tareas);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener tareas',
      error: error.message 
    });
  }
};

// Crear una nueva tarea con validación
exports.createTarea = async (req, res) => {
  try {
    const { titulo, categoria, fechaLimite } = req.body;
    
    if (!titulo || !categoria) {
      return res.status(400).json({ 
        message: 'Título y categoría son obligatorios' 
      });
    }
    
    if (fechaLimite && new Date(fechaLimite) < new Date()) {
      return res.status(400).json({ 
        message: 'La fecha límite no puede ser en el pasado' 
      });
    }
    
    const nuevaTarea = new Tarea(req.body);
    await nuevaTarea.save();

    res.status(201).json(nuevaTarea);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al crear tarea',
      error: error.message 
    });
  }
};

// Actualizar tarea con manejo de subtareas y validaciones
exports.updateTarea = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (updates.fechaLimite && new Date(updates.fechaLimite) < new Date()) {
      return res.status(400).json({ 
        message: 'La fecha límite no puede ser en el pasado' 
      });
    }
    
    if (updates.subtareas) {
      const tarea = await Tarea.findById(id);
      updates.progreso = calcularProgreso(updates.subtareas);
    }
    
    const tareaActualizada = await Tarea.findByIdAndUpdate(id, updates, { 
      new: true,
      runValidators: true
    });
    
    if (!tareaActualizada) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
    res.status(200).json(tareaActualizada);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al actualizar tarea',
      error: error.message 
    });
  }
};

// Eliminar tarea con verificación
exports.deleteTarea = async (req, res) => {
  try {
    const tareaEliminada = await Tarea.findByIdAndDelete(req.params.id);
    
    if (!tareaEliminada) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
    res.status(200).json({ 
      message: 'Tarea eliminada correctamente',
      tarea: tareaEliminada 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al eliminar tarea',
      error: error.message 
    });
  }
};

// Agregar subtarea
exports.agregarSubtarea = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion } = req.body;
    
    if (!descripcion) {
      return res.status(400).json({ message: 'Descripción es requerida' });
    }
    
    const tarea = await Tarea.findByIdAndUpdate(
      id,
      { $push: { subtareas: { descripcion } } },
      { new: true }
    );
    
    res.status(200).json(tarea);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al agregar subtarea',
      error: error.message 
    });
  }
};

// Actualizar estado de subtarea
exports.actualizarSubtarea = async (req, res) => {
  try {
    const { id, subtareaId } = req.params;
    const { completada } = req.body;
    
    const tarea = await Tarea.findById(id);
    if (!tarea) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    
    const subtarea = tarea.subtareas.id(subtareaId);
    if (!subtarea) {
      return res.status(404).json({ message: 'Subtarea no encontrada' });
    }
    
    subtarea.completada = completada;
    tarea.progreso = calcularProgreso(tarea.subtareas);
    
    await tarea.save();
    
    res.status(200).json(tarea);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al actualizar subtarea',
      error: error.message 
    });
  }
};

// Función para calcular progreso
function calcularProgreso(subtareas) {
  if (!subtareas || subtareas.length === 0) return 0;
  const completadas = subtareas.filter(st => st.completada).length;
  return Math.round((completadas / subtareas.length) * 100);
}
