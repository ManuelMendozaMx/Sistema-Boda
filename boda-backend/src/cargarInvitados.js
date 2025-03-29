const mongoose = require("mongoose");
require("dotenv").config();

const Invitado = require("./models/Invitado"); // Ajusta si la ruta de tu modelo es diferente

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/boda-db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Conectado a MongoDB");
  insertarInvitados();
})
.catch((err) => console.error("Error al conectar a MongoDB:", err));

const invitados = [
  {
    nombre: "Marcelino Díaz Martínez",
    acompanantes: [{ nombre: "Niño", esNino: true }],
    boletosExtraAdultos: 0,
    boletosExtraNinos: 0,
  },
  {
    nombre: "Rosalía Mendoza Ortega",
    acompanantes: [{ nombre: "Niño", esNino: true }],
    boletosExtraAdultos: 0,
    boletosExtraNinos: 0,
  },
  {
    nombre: "Said Emmanuel",
    acompanantes: [],
    boletosExtraAdultos: 0,
    boletosExtraNinos: 1,
  },
  {
    nombre: "Said Emmanuel +1",
    acompanantes: [],
    boletosExtraAdultos: 0,
    boletosExtraNinos: 1,
  },
  {
    nombre: "Más 10",
    acompanantes: [],
    boletosExtraAdultos: 0,
    boletosExtraNinos: 10,
  }
];

async function insertarInvitados() {
  try {
    await Invitado.insertMany(invitados);
    console.log("Invitados insertados correctamente");
    mongoose.disconnect();
  } catch (error) {
    console.error("Error al insertar invitados:", error);
    mongoose.disconnect();
  }
}
