const mongoose = require('mongoose');

const tareaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  completada: { type: Boolean, default: false },
  fechaLimite: Date,
}, { timestamps: true });

module.exports = mongoose.model('Tarea', tareaSchema);
