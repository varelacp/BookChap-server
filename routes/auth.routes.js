const router = require('express').Router();
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const auth = require('../config/firebase.config');
const Cart = require('../models/Cart.model');

const saltRounds = 10;

// Signup - Create a new user
router.post('/signup', async (req, res, next) => {
  const {email, password, name, address, role} = req.body;

  try {
    // check if all parameters have been provided
    if (
      email === '' ||
      password === '' ||
      name === '' ||
      address === '' ||
      role === ''
    ) {
      return res.status(400).json({message: 'All fields are mandatory'});
    }

    // use regex to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({message: 'Provide a valid email address'});
    }

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must have at least 6 characters and contain one number, one lowercase and one uppercase letter'
      });
    }

    const userExists = await User.findOne({email});

    if (userExists) {
      return res
        .status(400)
        .json({message: 'The provided email is already registered'});
    }

    // encrypt the password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // create the user
    const newUser = await User.create({
      email,
      name,
      password: hashedPassword,
      role,
      address
    });

    await Cart.create({user: newUser._id});

    res.json({email: newUser.email, name: newUser.name, _id: newUser._id});
  } catch (error) {
    console.log('An error occurred creating the user', error);
    next(error);
  }
});

// Login - Verifies and logs the user, returning the JWT
router.post('/login', async (req, res, next) => {
  const {email, password} = req.body;

  try {
    if (email === '' || password === '') {
      return res.status(400).json({message: 'All fields are mandatory'});
    }

    const user = await User.findOne({email});

    if (!user) {
      return res
        .status(400)
        .json({message: 'Provided email is not registered'});
    }

    // check if password is correct
    const isPasswordCorrect = bcrypt.compareSync(password, user.password);

    if (isPasswordCorrect) {
      // create an object that will be set as the JWT payload
      // DON'T SEND THE PASSWORD!
      const payload = {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      };

      const authToken = await auth.createCustomToken(
        user._id.toString(),
        payload
      );

      // send the JWT as response
      res.json({authToken});
    } else {
      res.status(400).json({message: 'Incorrect password'});
    }
  } catch (error) {
    console.log('An error occurred login in the user', error);
    next(error);
  }
});

// Login Google - Checks if user already exists, creates it otherwise
router.post('/signup-google', async (req, res, next) => {
  const {email, name} = req.body;
  try {
    // check if all parameters have been provided
    if (email === '' || name === '') {
      return res.status(400).json({message: 'All fields are mandatory'});
    }

    const user = await User.findOne({email});
    if (user) {
      return res.json({message: 'User already exists'});
    }

    // Creating the new user
    await User.create({
      email,
      name
    });
    res.json({message: 'User created successfully'});
  } catch (error) {
    console.log('An error occurred login the user', error);
    next(error);
  }
});

module.exports = router;
