const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { swaggerSpec, swaggerUi } = require('./swagger');

const app = express(); // 👈🏻 PRIMERO creas tu app

// Middleware para datos JSON (¡antes de cargar rutas!)
app.use(express.json());
// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Cargar rutas
const usersRoutes = require('./routes/users');
const productosRoutes = require('./routes/productos');
const orderRoutes = require('./routes/orders');

app.use('/api/users', usersRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/orders', orderRoutes); // 👈🏻 Después de crear app

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch((error) => console.error('❌ Error al conectar a MongoDB:', error));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../e-commerce')));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../e-commerce/index.html'));
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});