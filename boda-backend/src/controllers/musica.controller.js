const Cancion = require('../models/Cancion');

exports.getMusica = async (req, res) => {
  try {
    const canciones = await Cancion.find();
    res.status(200).json(canciones);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la música', error });
  }
};

exports.createCancion = async (req, res) => {
  try {
    const nuevaCancion = new Cancion(req.body);
    await nuevaCancion.save();
    res.status(201).json(nuevaCancion);
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar canción', error });
  }
};

exports.updateCancion = async (req, res) => {
  try {
    const cancionActualizada = await Cancion.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(cancionActualizada);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar canción', error });
  }
};

exports.deleteCancion = async (req, res) => {
  try {
    await Cancion.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Canción eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar canción', error });
  }
};
