const express = require('express');
const router = express.Router();
const Producto = require('../models/producto');
const { verificarToken, soloAdmin } = require('../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API para productos
 */
/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Actualizar producto (solo Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               precio:
 *                 type: number
 *               categoria:
 *                 type: string
 *               stock:
 *                 type: integer
 *               imagen:
 *                 type: string
 *     responses:
 *       200:
 *         description: Producto actualizado
 */

// Actualizar stock de producto
router.put('/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;

        const producto = await Producto.findById(id);

        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        producto.stock = stock;
        await producto.save();

        res.json({ mensaje: 'Stock actualizado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Crear un producto (solo Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - precio
 *               - categoria
 *               - stock
 *               - imagen
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Hello Kitty Plush
 *               precio:
 *                 type: number
 *                 example: 25
 *               categoria:
 *                 type: string
 *                 example: Plushies
 *               stock:
 *                 type: integer
 *                 example: 100
 *               imagen:
 *                 type: string
 *                 example: https://example.com/kitty.png
 *     responses:
 *       201:
 *         description: Producto creado
 */

// Crear un producto (solo admin)
router.post('/', verificarToken, soloAdmin, async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria, imagen, stock } = req.body;
    const nuevoProducto = new Producto({ nombre, descripcion, precio, categoria, imagen, stock });
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'No se pudo crear el producto' });
  }
});

/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Listar todos los productos
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de productos
 */

// Obtener todos los productos (público)
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

/**
 * @swagger
 * /api/productos/{id}:
 *   delete:
 *     summary: Eliminar producto (solo Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado
 */

// Eliminar un producto (solo admin)
router.delete('/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const productoEliminado = await Producto.findByIdAndDelete(id);

    if (!productoEliminado) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ mensaje: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const producto = await Producto.findById(id); // Asegúrate que Producto esté bien importado
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        console.error('Error al obtener producto por ID:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;