const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const UserModel = require('../models/Usuario');

// Clave secreta para firmar el token (en producción, usa variables de entorno)
const JWT_SECRET = 'mi_secreto_super_seguro';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API para usuarios
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Ana
 *               apellido:
 *                 type: string
 *                 example: Carrasco
 *               email:
 *                 type: string
 *                 example: ana@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Usuario ya existe
 */

// Registrar usuario
router.post('/register', async (req, res) => {
  const { nombre, apellido, email, password, rol } = req.body; // 👈🏻 AQUÍ
  try {
      const usuarioExistente = await Usuario.findOne({ email });
      if (usuarioExistente) {
          return res.status(400).json({ error: 'El usuario ya existe' });
      }
      const nuevoUsuario = new Usuario({ nombre, apellido, email, password, rol }); // 👈🏻 Y AQUÍ
      await nuevoUsuario.save();
      res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error en el registro' });
  }
});
  
  /**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login de usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: ana@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login exitoso
 *       400:
 *         description: Credenciales inválidas
 */

// Login de usuario
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const passwordValida = await usuario.compararPassword(password);
    if (!passwordValida) {
      return res.status(400).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
        {
          id: usuario._id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
          rol: usuario.rol
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );       
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el login' });
  }
});

const { verificarToken, soloAdmin } = require('../middlewares/auth');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios (solo Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       403:
 *         description: Acceso denegado
 */

// Obtener todos los usuarios (solo para admins)
router.get('/', verificarToken, soloAdmin, async (req, res) => {
  try {
    const usuarios = await Usuario.find({}, '-password'); // Excluye la contraseña
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

/**
 * @swagger
 * /api/users/validate-token:
 *   get:
 *     summary: Validar token actual
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *       401:
 *         description: Token inválido
 */

router.get('/validate-token', async (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.json({ valid: false });

  try {
      const decoded = jwt.verify(token, JWT_SECRET); // 👈🏻 AQUÍ
      const user = await UserModel.findById(decoded.id);
      if (!user) return res.json({ valid: false });

      res.json({
          valid: true,
          user: {
              nombre: user.nombre,
              apellido: user.apellido,
              email: user.email,
              rol: user.rol
          }
      });
  } catch (error) {
      console.error(error);
      res.json({ valid: false });
  }
});

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Actualizar perfil del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Ana
 *               apellido:
 *                 type: string
 *                 example: Carrasco
 *               email:
 *                 type: string
 *                 example: ana@example.com
 *               password:
 *                 type: string
 *                 example: nuevo123
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *       400:
 *         description: Error al actualizar
 */

// Actualizar perfil del usuario autenticado
router.put('/me', verificarToken, async (req, res) => {
  const userId = req.usuario.id;
  const { nombre, apellido, email, password } = req.body;

  try {
      const user = await Usuario.findById(userId);
      if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

      user.nombre = nombre || user.nombre;
      user.apellido = apellido || user.apellido;
      user.email = email || user.email;

      // Aquí agregas esto 👇
      if (password) {
          const bcrypt = require('bcryptjs');
          const hashed = await bcrypt.hash(password, 10);
          user.password = hashed;
      }

      await user.save();

      res.json({
          mensaje: 'Perfil actualizado',
          user: {
              nombre: user.nombre,
              apellido: user.apellido,
              email: user.email,
              rol: user.rol
          }
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

module.exports = router;