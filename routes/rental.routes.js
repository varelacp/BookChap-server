const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental.model');
const Book = require('../models/Book.model');
const User = require('../models/User.model');
const { isAuthenticated } = require('../middleware/firebase.middleware');
const { isAdmin } = require('../middleware/isAdmin');
const moment = require('moment');

// Get all active rentals
router.get(
  '/rentals/active',
  isAuthenticated,
  isAdmin,
  async (req, res, next) => {
    try {
      // Find all rentals that have a return date greater than the current date
      console.log('Before retrieving active rentals');
      const activeRentals = await Rental.find({
        returnDate: { $gt: new Date() }
      })
        .populate('book')
        .populate('user');

      console.log('Active rentals:', activeRentals);

      res.json(activeRentals);
    } catch (error) {
      console.log('An error occurred while getting active rentals:', error);
      next(error);
    }
  }
);

// Get all rentals for a user
router.get(
  '/users/:userId/rentals',
  isAuthenticated,
  async (req, res, next) => {
    const { userId } = req.params;

    try {
      // Find all rentals associated with the specified user
      const userRentals = await Rental.find({ user: userId }).populate('book');

      res.json(userRentals);
    } catch (error) {
      console.log('An error occurred while getting user rentals:', error);
      next(error);
    }
  }
);

// Rent a book
router.post('/rentals', isAuthenticated, async (req, res, next) => {
  const { bookId, userId, rentalDate, returnDate } = req.body;

  try {
    // Check if the book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Parse the returnDate string using Moment.js
    const parsedReturnDate = moment(returnDate, 'DD-MM-YYYY').toDate();

    // Create a new rental
    const newRental = await Rental.create({
      book: bookId,
      user: userId,
      rentalDate,
      returnDate: parsedReturnDate
    });

    //  book's availability and rentedBy fields updated
    book.availability = false;
    book.rentedBy = userId;
    await book.save();

    res.json(newRental);
  } catch (error) {
    console.log('An error occurred while renting a book:', error);
    next(error);
  }
});

// Return a book
router.put('/rentals/:id/return', isAuthenticated, async (req, res, next) => {
  const { id } = req.params;

  try {
    // Find the rental
    const rental = await Rental.findById(id);
    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // Find the book
    const book = await Book.findById(rental.book);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Update the rental's returnDate
    rental.returnDate = new Date();
    await rental.save();

    // Update the book's availability and rentedBy fields
    book.availability = true;
    book.rentedBy = null;
    await book.save();

    res.json(rental);
  } catch (error) {
    console.log('An error occurred while returning a book:', error);
    next(error);
  }
});

module.exports = router;
