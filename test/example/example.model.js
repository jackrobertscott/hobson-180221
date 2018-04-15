const { Schema } = require('../../lib/index');

const exampleSchema = new Schema({
  shape: {
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
  },
});

module.exports = exampleSchema.compile('Example');
