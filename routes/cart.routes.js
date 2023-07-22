const router = require('express').Router();
const Cart = require('../models/Cart.model');
const {isAuthenticated} = require('../middleware/firebase.middleware');

// Add an item to the cart
router.post('/cart', isAuthenticated, async (req, res, next) => {
  try {
    const {bookId, userId} = req.body;
    console.log(req.body);

    let cart = await Cart.findOne({user: userId});

    if (!cart) {
      cart = await Cart.create({user: userId, items: [{book: bookId}]});
    } else {
      const bookExists = cart.items.some(item => item.book?.equals(bookId));
      if (!bookExists) {
        cart.items.push({book: bookId});
        await cart.save();
      }
    }

    res.json(cart);
  } catch (error) {
    console.log('An error occurred while adding an item to the cart:', error);
    next(error);
  }
});

// Remove from Cart
router.delete(
  '/cart/:userId/items/:bookId',
  isAuthenticated,
  async (req, res, next) => {
    try {
      const {bookId, userId} = req.params;

      const cart = await Cart.findOne({user: userId});

      if (!cart) {
        return res.status(404).json({message: 'Cart not found'});
      }

      cart.items = cart.items.filter(item => !item.book.equals(bookId));
      await cart.save();

      res.json(cart);
    } catch (error) {
      console.log(
        'An error occurred while removing an item from the cart:',
        error
      );
      next(error);
    }
  }
);

// Get Cart Items
router.get('/cart/:userId/items', isAuthenticated, async (req, res, next) => {
  try {
    const {userId} = req.params;

    let cart = await Cart.findOne({user: userId}).populate('items.book');

    if (!cart) {
      cart = await Cart.create({user: userId});
      // return res.status(404).json({message: 'Cart not found'});
    }
    const cartItems = cart.items.map(item => item.book);
    res.json({cartItems});
  } catch (error) {
    console.log('An error occurred while getting cart items:', error);
    next(error);
  }
});

// Clear Cart
router.delete('/cart/:userId', isAuthenticated, async (req, res, next) => {
  try {
    const {userId} = req.params;

    const cart = await Cart.findOne({user: userId});

    if (!cart) {
      return res.status(404).json({message: 'Cart not found'});
    }

    cart.items = [];
    await cart.save();

    res.json({message: 'Cart cleared'});
  } catch (error) {
    console.log('An error occurred while clearing the cart:', error);
    next(error);
  }
});

module.exports = router;
