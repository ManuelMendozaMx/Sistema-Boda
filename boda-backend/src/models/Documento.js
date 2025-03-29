const mongoose = require('mongoose');

const documentoSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  tipo: String,
  archivoUrl: String,
  fecha: Date,
}, { timestamps: true });

module.exports = mongoose.model('Documento', documentoSchema);
