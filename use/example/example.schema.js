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
});

module.exports = exampleSchema;
