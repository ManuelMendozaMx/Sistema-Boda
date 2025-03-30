const mongoose = require('mongoose');

const gastoSchema = new mongoose.Schema({
  descripcion: { 
    type: String, 
    required: [true, 'La descripción es obligatoria'],
    trim: true,
    maxlength: 100
  },
  monto: { 
    type: Number, 
    required: [true, 'El monto es obligatorio'],
    min: [0, 'El monto no puede ser negativo']
  },
  categoria: {
    type: String,
    required: true,
    enum: {
      values: ['banquete', 'vestuario', 'decoracion', 'fotografia', 'musica', 'invitaciones', 'salon', 'otros'],
      message: 'Categoría no válida'
    },
    default: 'otros'
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  proveedor: {
    nombre: String,
    contacto: String
  },
  estadoPago: {
    type: String,
    enum: ['pendiente', 'parcial', 'pagado'],
    default: 'pendiente'
  },
  montoPagado: {
    type: Number,
    default: 0,
    validate: {
      validator: function(value) {
        return value <= this.monto;
      },
      message: 'El monto pagado no puede exceder el monto total'
    }
  },
  comprobante: String
  // ¡Se eliminaron usuarioId y eventoId!
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('Gasto', gastoSchema);
