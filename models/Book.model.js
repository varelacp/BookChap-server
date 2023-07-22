const { Schema, model } = require('mongoose');

const bookSchema = new Schema({
    title: String,
    author: [String],
    description: String,
    availability: Boolean,
    rentedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    category: String,
    imgUrl: String,
    isbn: String,
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    rentalPrice: Number,
    apiId: String
});

module.exports = model('Book', bookSchema);
