const {Schema, model} = require('mongoose');

const cartSchema = new Schema(
  {
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    items: [
      {
        book: {type: Schema.Types.ObjectId, ref: 'Book'}
      }
    ]
  },
  {timestamps: true}
);

module.exports = model('Cart', cartSchema);
