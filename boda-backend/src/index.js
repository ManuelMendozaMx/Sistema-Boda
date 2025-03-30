const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;



// Middlewares
// ✅ Middlewares (IMPORTANTE QUE ESTÉN ANTES DE LAS RUTAS)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


const invitadosRoutes = require('./routes/invitados.routes');
const tareasRoutes = require('./routes/tareas.routes');
const gastosRoutes = require('./routes/gastos.routes');
const proveedoresRoutes = require('./routes/proveedores.routes');
const documentosRoutes = require('./routes/documentos.routes');
const inspiracionRoutes = require('./routes/inspiracion.routes');
const musicaRoutes = require('./routes/musica.routes');
const mesaRoutes = require('./routes/layout.routes');

app.use("/api/layout", mesaRoutes);
app.use('/api/tareas', tareasRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/inspiracion', inspiracionRoutes);
app.use('/api/musica', musicaRoutes);
app.use('/api/invitados', invitadosRoutes);



mongoose.connect("mongodb://localhost:27017/boda-db", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log("✅ Conectado a MongoDB");
  
  // Inicializar layout solo si es necesario
  try {
    //await Layout.init();
    console.log("✅ Verificación de layout completada");
  } catch (err) {
    console.error("⚠️ Error verificando layout:", err);
  }
})
.catch(err => console.error("❌ Error de conexión a MongoDB:", err));



// Ruta base
app.get('/test', async (req, res) => {
    try {
      res.status(200).json({ message: "✅ Servidor y MongoDB funcionando correctamente 🎉" });
    } catch (error) {
      res.status(500).json({ error: "❌ Error en la prueba de conexión" });
    }
  });
  
// Escucha del servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
