const Tarea = require('../models/Tarea');

exports.getTareas = async (req, res) => {
  try {
    const tareas = await Tarea.find();
    res.status(200).json(tareas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tareas', error });
  }
};

exports.createTarea = async (req, res) => {
  try {
    const nuevaTarea = new Tarea(req.body);
    await nuevaTarea.save();
    res.status(201).json(nuevaTarea);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear tarea', error });
  }
};

exports.updateTarea = async (req, res) => {
  try {
    const tareaActualizada = await Tarea.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(tareaActualizada);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar tarea', error });
  }
};

exports.deleteTarea = async (req, res) => {
  try {
    await Tarea.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Tarea eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar tarea', error });
  }
};
