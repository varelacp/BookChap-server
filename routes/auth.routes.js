const router = require('express').Router();
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isAuthenticated } = require('../middleware/jwt.middleware');

const saltRounds = 10;

// Signup - Create a new user
router.post('/signup', async (req, res, next) => {
  const { email, password, name, address, phoneNumber, role, profileImage } =
    req.body;

  console.log('Request body:', req.body);

  try {
    // Check if all the parameters have been provided
    if (
      email === '' ||
      password === '' ||
      name === '' ||
      address === '' ||
      role === ''
    ) {
      return json.status(400).json({ message: 'All fields are mandatory' });
    }
    // use regex to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Provide a valid email address' });
    }

    const passwordRegex = /^(?=.\d)(?=.[a-z])(?=.[A-Z])(?=.[a-zA-Z]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          'Password must have at least 6 characters and contain one number, one lowercase and one uppercase letter'
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res
        .status(400)
        .json({ message: 'The provided email is already registered' });
    }

    // encrypt the password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // create the user
    const newUser = await User.create({
      email,
      name,
      password: hashedPassword,
      address,
      phoneNumber: phoneNumber ? phoneNumber : null,
      role,
      profileImage: profileImage ? profileImage : undefined
    });

    res.json({
      email: newUser.email,
      name: newUser.name,
      _id: newUser._id,
      address: newUser.address
    });
  } catch (error) {
    console.log('', error);
    next(error);
  }
});

// Login - Verifies and logs the user, returning the JWT

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (email === '' || password === '') {
      return res.status(400).json({ message: 'All fields are mandatory' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: ' Provided email is not registered' });
    }

    // check the password is correct
    const isPasswordCorrect = bcrypt.compareSync(password, user.password);

    //create an object that will be set as the JWT payload
    //DON'T SEND THE PASSWORD!
    if (isPasswordCorrect) {
      const payload = {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      };

      // create and sign the JWT
      // we pass the user payload and the token secret defined in .env
      const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
        algorithm: 'HS256', // the algorithm to encrypt the token , default is HS256
        expiresIn: '6h' // TTL: Time to live of the JWT
      });

      // send the JWT as response
      res.json({ authToken });
    } else {
      res.status(400).json({ message: 'Incorrect password' });
    }
  } catch (error) {
    console.log('An error occured login in the user', error);
    next(error);
  }
});

// verify - use to check if the JWT stored on the client is valid
router.get('/verify', isAuthenticated, (req, res, next) => {
  //if the JWT is valid, it gets decoded and made available in req.payload
  console.log('req.payload', req.payload);

  res.json(req.payload);
});

module.exports = router;
