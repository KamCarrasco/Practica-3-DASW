const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [
    {
      name: String,
      quantity: Number,
      price: Number,
      image: String
    }
  ],
  total: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const OrderModel = mongoose.model('Orden', orderSchema);

module.exports = { OrderModel }; // 👈🏻 Así