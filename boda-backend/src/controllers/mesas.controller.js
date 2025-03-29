// controllers/mesas.controller.js
const Mesa = require("../models/Mesa");

exports.getMesas = async (req, res) => {
  try {
    const mesas = await Mesa.find().populate("invitados");
    res.status(200).json(mesas);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener mesas", err });
  }
};

exports.createMesa = async (req, res) => {
  try {
    const nuevaMesa = new Mesa(req.body);
    await nuevaMesa.save();
    res.status(201).json(nuevaMesa);
  } catch (err) {
    res.status(400).json({ error: "Error al crear mesa", err });
  }
};

exports.updateMesa = async (req, res) => {
  try {
    const mesaActualizada = await Mesa.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(mesaActualizada);
  } catch (err) {
    res.status(400).json({ error: "Error al actualizar mesa", err });
  }
};

exports.deleteMesa = async (req, res) => {
  try {
    await Mesa.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Mesa eliminada" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar mesa", err });
  }
};
