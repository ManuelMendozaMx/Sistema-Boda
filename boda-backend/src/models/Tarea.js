const mongoose = require('mongoose');

const tareaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: String,
  estado: { 
    type: String, 
    enum: ['pendiente', 'en_progreso', 'completada', 'cancelada'], 
    default: 'pendiente' 
  },
  prioridad: { 
    type: String, 
    enum: ['baja', 'media', 'alta'], 
    default: 'media' 
  },
  categoria: { 
    type: String,
    enum: ['organización', 'invitados', 'ceremonia', 'banquete', 'vestuario', 'decoración', 'otros'],
    required: true
  },
  fechaLimite: { 
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value >= new Date();
      },
      message: 'La fecha límite debe ser futura'
    }
  },
  equipo: { 
    type: String,
    enum: ['novios', 'familia_novia', 'familia_novio', 'amigos', 'proveedores']
  },
  progreso: { 
    type: Number, 
    min: 0, 
    max: 100, 
    default: 0 
  },
  subtareas: [{
    descripcion: String,
    completada: { type: Boolean, default: false }
  }],
  presupuestoEstimado: Number,
  gastoReal: Number,
  proveedor: {
    nombre: String,
    contacto: String
  },
  notas: String,
  archivos: [{
    nombre: String,
    url: String
  }],
  recordatorios: [{
    fecha: { type: Date, required: true },
    enviado: { type: Boolean, default: false }
  }],
  notificar: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Opcional: Campo virtual para días restantes
tareaSchema.virtual('diasRestantes').get(function() {
  if (!this.fechaLimite) return null;
  const diff = this.fechaLimite - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Tarea', tareaSchema);
