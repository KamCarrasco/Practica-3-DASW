const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: String,
  precio: { type: Number, required: true },
  categoria: String,
  imagen: String,
  stock: { type: Number, default: 0 }
});

const Producto = mongoose.model('Producto', productoSchema);

module.exports = Producto;