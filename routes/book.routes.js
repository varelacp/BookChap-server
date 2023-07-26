const router = require('express').Router();
const Book = require('../models/Book.model');
const mongoose = require('mongoose');
const {isAuthenticated} = require('../middleware/firebase.middleware');
const {isAdmin} = require('../middleware/isAdmin');
const fileUploader = require('../config/cloudinary.config');

// Create a new book
router.post('/books', isAuthenticated, async (req, res, next) => {
  const {
    title,
    author,
    description,
    category,
    imgUrl,
    isbn,
    rentedBy,
    availability,
    rating = 0,
    rentalPrice
  } = req.body;

  try {
    const newBook = await Book.create({
      title,
      author,
      description,
      availability: true,
      rentedBy: null,
      category,
      imgUrl,
      isbn,
      rating: rating || 0,
      rentalPrice // Use the provided rating or set it to 0 if not available
    });

    res.json(newBook);
  } catch (error) {
    console.log('An error occurred creating a new book', error);
    next(error);
  }
});

// Retrieves all the books
router.get('/books', async (req, res, next) => {
  try {
    const allBooks = await Book.find();
    res.json(allBooks);
  } catch (error) {
    console.log('An error occurred getting all the books', error);
    next(error);
  }
});

// Retrieves a specific book by Id
router.get('/books/:id', async (req, res, next) => {
  const {id} = req.params;

  try {
    // Check if the id is a valid mongoose id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({message: 'Specified id is not valid'});
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({message: 'No book found with that id'});
    }

    res.json(book);
  } catch (error) {
    console.log('An error occurred getting the book', error);
    next(error);
  }
});

// Update a specific book by Id
router.put('/books/:id', isAuthenticated, isAdmin, async (req, res, next) => {
  const {id} = req.params;
  const {
    title,
    author,
    availability,
    description,
    category,
    imgUrl,
    isbn,
    rentalPrice
  } = req.body;

  try {
    // Check if the provided id is a valid mongoose id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({message: 'Specified id is not valid'});
    }

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      {
        title,
        author,
        description,
        availability,
        category,
        imgUrl,
        isbn,
        rentalPrice
      },
      {new: true}
    );

    if (!updatedBook) {
      return res.status(404).json({message: 'No book found with specified id'});
    }

    res.json(updatedBook);
  } catch (error) {
    console.log('An error occurred updating the book', error);
    next(error);
  }
});

// Delete a specific book by Id
router.delete('/books/:id', isAuthenticated, async (req, res, next) => {
  const {id} = req.params;

  try {
    // Check if the provided id is a valid mongoose id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({message: 'Specified id is not valid'});
    }

    await Book.findByIdAndDelete(id);
    res.json({message: `Book with id ${id} was deleted successfully`});
  } catch (error) {
    console.log('An error occurred deleting the book', error);
    next(error);
  }
});

// Retrieves a specific book by ISBN
router.get('/books/search/isbn/:isbn', async (req, res, next) => {
  const {isbn} = req.params;

  try {
    const book = await Book.findOne({isbn});

    if (!book) {
      return res.status(404).json({message: 'No book found with that ISBN'});
    }

    res.json(book);
  } catch (error) {
    console.log('An error occurred getting the book by ISBN', error);
    next(error);
  }
});

// Retrieves a specific book by category
router.get('/books/search/category/:category', async (req, res, next) => {
  const {category} = req.params;

  try {
    const books = await Book.find({category});

    res.json(books);
  } catch (error) {
    console.log('An error occurred getting the books by category', error);
    next(error);
  }
});

// route that receives the image, sends ir to cloudinary and returns an URL
router.post('/upload', fileUploader.single('file'), (req, res, next) => {
  try {
    res.json({fileUrl: req.file.path});
  } catch (error) {
    res.status(500).json({message: 'An error occured uploading the image'});
    next(error);
  }
});

// backend API route for saving books
router.post('/books/save', async (req, res, next) => {
  const {books} = req.body;

  try {
    // Save the books to your database
    await Book.insertMany(books);

    res.json({message: 'Books saved successfully'});
  } catch (error) {
    console.log('An error occurred while saving the books:', error);
    next(error);
  }
});

module.exports = router;
