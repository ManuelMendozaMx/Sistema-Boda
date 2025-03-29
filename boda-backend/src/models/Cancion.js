const mongoose = require('mongoose');

const cancionSchema = new mongoose.Schema({
  titulo: String,
  artista: String,
  momento: String, // Ej: ceremonia, recepción, fiesta
  enlace: String, // Spotify, YouTube, etc.
}, { timestamps: true });

module.exports = mongoose.model('Cancion', cancionSchema);
