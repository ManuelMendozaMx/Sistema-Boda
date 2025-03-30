const mongoose = require("mongoose");

/*** CONTADOR PARA AUTO-INCREMENTO ***/
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
}, { versionKey: false });

const Counter = mongoose.model('Counter', counterSchema);

/*** ESQUEMA DE MESA ***/
const MesaSchema = new mongoose.Schema({
  id: String,
  nMesa: {
    type: Number,
    required: true,
    min: 1,
    max: 55,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} no es un número entero'
    }
  },
  tipo: {
    type: String,
    enum: ['redonda', 'cuadrada', 'rectangular'],
    required: true
  },
  capacidad: {
    type: Number,
    required: true,
    min: 1
  },
  invitadosAsignados: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      nombre: String,
      acompanantes: [
        {
          nombre: String,
          esNino: Boolean
        }
      ],
      boletosExtraAdultos: { type: Number, default: 0 },
      boletosExtraNinos: { type: Number, default: 0 }
    }
  ]
}, { versionKey: false });

// Middleware para auto-incremento de nMesa (mejorado)
MesaSchema.pre('save', async function(next) {
  if (this.nMesa) return next(); // Si ya tiene nMesa, no hacer nada
  
  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: 'mesaId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true, lean: true }
    );
    
    // Verificar límite y asignar número
    if (counter.seq > 55) {
      await Counter.findByIdAndUpdate(
        { _id: 'mesaId' },
        { $set: { seq: 0 } }
      );
      throw new Error('Límite de mesas alcanzado. Reiniciando contador.');
    }
    
    this.nMesa = counter.seq;
    next();
  } catch (err) {
    console.error('Error en auto-incremento:', err);
    next(err);
  }
});

/*** ESQUEMA DE ESPACIO (más flexible) ***/
const EspacioSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true,
    match: [/^espacio-\d+$/, 'ID de espacio no válido'] 
  },
  mesa: {
    type: MesaSchema,
    default: null
  }
}, { versionKey: false });

/*** ESQUEMA DE LAYOUT (con migración automática) ***/
const LayoutSchema = new mongoose.Schema({
  espacios: { 
    type: [EspacioSchema], 
    required: true
  },
  creadoEn: {
    type: Date,
    default: Date.now
  },
  version: {
    type: Number,
    default: 2 // Versión del esquema
  }
}, { versionKey: false });

// Middleware para migración y validación
LayoutSchema.pre('save', function(next) {
  // Migración: asegurar 55 espacios
  if (this.espacios.length !== 55) {
    this.espacios = Array.from({ length: 55 }, (_, i) => ({
      id: `espacio-${i}`,
      mesa: this.espacios[i]?.mesa || null
    }));
  }

  // Migración: asignar nMesa si falta
  this.espacios.forEach(espacio => {
    if (espacio.mesa && !espacio.mesa.nMesa) {
      espacio.mesa.nMesa = parseInt(espacio.id.replace('espacio-', '')) + 1;
    }
  });
  
  next();
});

/*** INICIALIZACIÓN MEJORADA ***/
LayoutSchema.statics.init = async function() {
  try {
    const count = await this.countDocuments();
    if (count === 0) {
      const espacios = Array.from({ length: 55 }, (_, i) => ({
        id: `espacio-${i}`,
        mesa: null
      }));
      
      await this.create({ espacios });
      await Counter.findOneAndUpdate(
        { _id: 'mesaId' },
        { $set: { seq: 0 } },
        { upsert: true }
      );
      
      console.log("✅ Layout inicial creado");
      return true;
    }
    
    // Migración: actualizar layouts existentes
    const layouts = await this.find({ version: { $ne: 2 } });
    for (const layout of layouts) {
      layout.version = 2;
      await layout.save();
    }
    
    return true;
  } catch (err) {
    console.error("❌ Error inicializando layout:", err);
    throw err;
  }
};

module.exports = {
  Mesa: mongoose.model("Mesa", MesaSchema),
  Layout: mongoose.model("Layout", LayoutSchema),
  Counter
};