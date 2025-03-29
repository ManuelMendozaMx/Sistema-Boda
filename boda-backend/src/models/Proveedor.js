const mongoose = require('mongoose');

const proveedorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  servicio: String,
  contacto: {
    telefono: String,
    email: String
  },
  contratado: { type: Boolean, default: false },
  notas: String,
}, { timestamps: true });

module.exports = mongoose.model('Proveedor', proveedorSchema);
