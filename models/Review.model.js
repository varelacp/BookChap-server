const {Schema, model} = require('mongoose');

const reviewSchema = new Schema({
  review: {
    type: String
  }
});

module.exports = model('Review', reviewSchema);
