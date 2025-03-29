// models/Mesa.js
const mongoose = require("mongoose");

const mesaSchema = new mongoose.Schema({
  id: { type: String, required: true }, // ID único (podrías usar el generado por frontend o uno propio)
  tipo: { type: String, enum: ["redonda", "cuadrada"], required: true },
  capacidad: { type: Number, required: true },
  posicion: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  invitados: [{ type: mongoose.Schema.Types.ObjectId, ref: "Invitado" }],
});

module.exports = mongoose.model("Mesa", mesaSchema);
