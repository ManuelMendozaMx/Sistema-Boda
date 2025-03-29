const mongoose = require("mongoose");

const acompananteSchema = new mongoose.Schema({
  nombre: String,
  esNino: { type: Boolean, default: false }
});

const invitadoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  boletosExtraAdultos: { type: Number, default: 0 },
  boletosExtraNinos: { type: Number, default: 0 },
  acompanantes: [acompananteSchema],
  asignadoEnMesa: { type: Boolean, default: false } // << NUEVO CAMPO
});

module.exports = mongoose.model("Invitado", invitadoSchema);
