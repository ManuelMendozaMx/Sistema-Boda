const mongoose = require('mongoose');

const gastoSchema = new mongoose.Schema({
  descripcion: { type: String, required: true },
  monto: { type: Number, required: true },
  fecha: Date,
}, { timestamps: true });

module.exports = mongoose.model('Gasto', gastoSchema);
