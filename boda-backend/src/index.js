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
const mesaRoutes = require('./routes/mesas.routes');

app.use("/api/mesas", mesaRoutes);
app.use('/api/tareas', tareasRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/inspiracion', inspiracionRoutes);
app.use('/api/musica', musicaRoutes);
app.use('/api/invitados', invitadosRoutes);



// Conexión con MongoDB
mongoose.connect(process.env.DATABASE_URL)
  .then(() => console.log('🟢 MongoDB conectado con éxito'))
  .catch((err) => console.error('Error al conectar MongoDB:', err));

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
