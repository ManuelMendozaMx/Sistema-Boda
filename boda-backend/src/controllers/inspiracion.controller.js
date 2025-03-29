const Inspiracion = require('../models/Inspiracion');

exports.getInspiraciones = async (req, res) => {
  try {
    const inspiraciones = await Inspiracion.find();
    res.status(200).json(inspiraciones);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener inspiraciones', error });
  }
};

exports.createInspiracion = async (req, res) => {
  try {
    const nuevaInspiracion = new Inspiracion(req.body);
    await nuevaInspiracion.save();
    res.status(201).json(nuevaInspiracion);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear inspiración', error });
  }
};

exports.updateInspiracion = async (req, res) => {
  try {
    const inspiracionActualizada = await Inspiracion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(inspiracionActualizada);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar inspiración', error });
  }
};

exports.deleteInspiracion = async (req, res) => {
  try {
    await Inspiracion.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Inspiración eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar inspiración', error });
  }
};
