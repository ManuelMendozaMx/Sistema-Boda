const Gasto = require('../models/Gasto');

exports.getGastos = async (req, res) => {
  try {
    const gastos = await Gasto.find();
    res.status(200).json(gastos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener gastos', error });
  }
};

exports.createGasto = async (req, res) => {
  try {
    const nuevoGasto = new Gasto(req.body);
    await nuevoGasto.save();
    res.status(201).json(nuevoGasto);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear gasto', error });
  }
};

exports.updateGasto = async (req, res) => {
  try {
    const gastoActualizado = await Gasto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(gastoActualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar gasto', error });
  }
};

exports.deleteGasto = async (req, res) => {
  try {
    await Gasto.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Gasto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar gasto', error });
  }
};
