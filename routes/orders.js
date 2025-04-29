const express = require('express');
const router = express.Router();
const { OrderModel } = require('../models/Orden'); // ← OJO aquí, si tu modelo está en models/Orden.js

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: API para órdenes
 */
/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Listar órdenes del usuario
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de órdenes
 */

// GET todas las órdenes
router.get('/', async (req, res) => {
  try {
    const orders = await OrderModel.find();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching orders' });
  }
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Crear una nueva orden
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - total
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *                     image:
 *                       type: string
 *               total:
 *                 type: number
 *                 example: 150
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 */

// POST crear nueva orden
router.post('/', async (req, res) => {
  try {
    const nuevaOrden = new OrderModel(req.body);
    await nuevaOrden.save();
    res.status(201).json(nuevaOrden);
  } catch (error) {
    res.status(400).json({ error: 'Error creating order' });
  }
});

module.exports = router; // 👈🏻 ESTO DEBE IR ASÍ