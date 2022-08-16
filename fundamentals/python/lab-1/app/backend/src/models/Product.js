const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'product name is required'],
  },
  price: {
    type: Number,
    required: [true, 'price is required'],
  },
  description: {
    type: String,
    maxlength: 300,
  },
  created: {
    type: Number,
    default: Date.now(),
  },
  currency: {
    type: Object,
    default: {
      id: 'USD',
      format: '$',
    },
  },
  sizes: {
    type: Array,
    required: true,
  },
  productCode: String,
  images: [
    {
      src: String
    },
  ],
  category: {
    type: String,
    default: 'tea',
    required: [true, 'product category is required'],
  },
  teaType: {
    type: Number,
    default: 1, // 1:All 2:Boba 3:Latte 4:Chills
  },
  status: {
    type: Number,
    default: 1, // 0:Out of stock, 1:New 2:Available 3:Upcoming
  },
  ratings: {
    total: Number,
    avg: Number,
    reviews: [Object],
  },
});

module.exports = mongoose.model('Product', productSchema);
