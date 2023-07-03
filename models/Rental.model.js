const { Schema, model } = require('mongoose');

const rentalSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: 'Book' },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  rentalDate: Date,
  returnDate: Date
});

module.exports = model('Rental', rentalSchema);
