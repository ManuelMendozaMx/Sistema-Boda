const Invitado = require('../models/Invitado');

exports.createInvitado = async (req, res) => {
  try {
    console.log("REQ.BODY RECIBIDO:", req.body);

    const {
      nombre,
      boletosExtraAdultos = 0,
      boletosExtraNinos = 0,
      acompanantes = []
    } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: "El nombre del invitado es requerido." });
    }

    const nuevoInvitado = new Invitado({
      nombre,
      boletosExtraAdultos,
      boletosExtraNinos,
      acompanantes
    });

    await nuevoInvitado.save();
    res.status(201).json(nuevoInvitado);
  } catch (error) {
    console.error("ERROR AL CREAR INVITADO:", error);
    res.status(500).json({ message: "Error al crear invitado", error });
  }
};

// FUNCIONES FALTANTES 👇

exports.getInvitados = async (req, res) => {
  try {
    const invitados = await Invitado.find();
    res.status(200).json(invitados);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener invitados', error });
  }
};

exports.updateInvitado = async (req, res) => {
  try {
    const invitadoActualizado = await Invitado.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(invitadoActualizado);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar invitado', error });
  }
};

exports.deleteInvitado = async (req, res) => {
  try {
    await Invitado.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Invitado eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar invitado', error });
  }
};
