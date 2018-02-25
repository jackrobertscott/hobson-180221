const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  comments: {
    type: Number,
    required: true,
    default: 0,
  },
  magic: {
    wands: {
      type: Number,
      min: 1000,
    },
  },
}, {
  timestamps: true,
});

module.exports = exampleSchema;
