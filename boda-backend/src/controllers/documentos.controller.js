const Documento = require('../models/Documento');

exports.getDocumentos = async (req, res) => {
  try {
    const documentos = await Documento.find();
    res.status(200).json(documentos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener documentos', error });
  }
};

exports.createDocumento = async (req, res) => {
  try {
    const nuevoDocumento = new Documento(req.body);
    await nuevoDocumento.save();
    res.status(201).json(nuevoDocumento);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear documento', error });
  }
};
