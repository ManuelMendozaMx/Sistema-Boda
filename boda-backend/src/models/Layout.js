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
  id: String,
  mesa: {
    type: MesaSchema,
    default: null
  }
});

const LayoutSchema = new mongoose.Schema({
  espacios: [EspacioSchema],
  creadoEn: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Layout", LayoutSchema);
