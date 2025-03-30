const mongoose = require("mongoose");


const MesaSchema = new mongoose.Schema({
  id: String,
  tipo: String,
  capacidad: Number,
  invitadosAsignados: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      nombre: String,
      acompanantes: [
        {
          nombre: String,
          esNino: Boolean
        }
      ]
    }
  ]
});

const EspacioSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  mesa: {
    type: MesaSchema,
    default: null
  }
});

const LayoutSchema = new mongoose.Schema({
  espacios: { 
    type: [EspacioSchema], 
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length === 55; // Fuerza 55 espacios
      },
      message: "Debe haber exactamente 55 espacios"
    }
  },
  creadoEn: {
    type: Date,
    default: Date.now
  }
});

// Middleware para inicializar espacios vacíos si no existen
LayoutSchema.pre("save", function(next) {
  if (this.espacios.length === 0) {
    this.espacios = Array.from({ length: 55 }, (_, i) => ({
      id: `espacio-${i}`,
      mesa: null
    }));
  }
  next();
});



LayoutSchema.statics.init = async function() {
  // Si ya hay una inicialización en curso, retorna esa promesa
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      const count = await this.countDocuments();
      if (count === 0) {
        const espacios = Array.from({ length: 55 }, (_, i) => ({
          id: `espacio-${i}`,
          mesa: null
        }));
        await this.create({ espacios });
        console.log("✅ Layout inicial creado con 55 espacios vacíos");
      } else {
        console.log("ℹ️ Layout ya existe en la base de datos");
      }
      return true;
    } catch (err) {
      console.error("❌ Error inicializando layout:", err);
      throw err;
    } finally {
      initializationPromise = null;
    }
  })();

  return initializationPromise;
};

module.exports = mongoose.model("Layout", LayoutSchema);