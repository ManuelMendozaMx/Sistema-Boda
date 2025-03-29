const mongoose = require('mongoose');

const inspiracionSchema = new mongoose.Schema({
  titulo: String,
  imagenUrl: String,
  descripcion: String,
}, { timestamps: true });

module.exports = mongoose.model('Inspiracion', inspiracionSchema);
