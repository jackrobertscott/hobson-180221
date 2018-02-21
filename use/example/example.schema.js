const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  comments: {
    type: Number,
    required: true,
    default: 0,
  },
});
