const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
    nombre: String,
    apellido: String,
    email: { type: String, unique: true },
    password: String,
    rol: { type: String, default: 'client' } // 👈🏻 debe estar esto
});

// Método para comparar contraseñas
usuarioSchema.methods.compararPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Método para comparar contraseñas en el login
usuarioSchema.methods.compararPassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

// Middleware para encriptar la contraseña antes de guardarla
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const Usuario = mongoose.model('Usuario', usuarioSchema);
module.exports = Usuario;
