const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const {isAuthenticated} = require('../middleware/firebase.middleware');
const fileUploader = require('../config/cloudinary.config');
const {isAdmin} = require('../middleware/isAdmin');

// user dashboard
router.get('/user-dashboard', isAuthenticated, async (req, res) => {
  try {
    const userId = req.payload._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    const dashboardData = {
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      address: user.address,
      phoneNumber: user.phoneNumber,
      role: user.role
    };

    res.json(dashboardData);
  } catch (error) {
    console.log('An error occurred while retrieving user dashboard:', error);
    res.status(500).json({message: 'Server error'});
  }
});

// admin dashboard
router.get('/admin-dashboard', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const userId = req.payload._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({message: 'User not found'});
    }

    // Perform admin-specific actions

    const dashboardData = {
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      address: user.address,
      phoneNumber: user.phoneNumber,
      role: user.role
    };

    res.json(dashboardData);
  } catch (error) {
    console.log('An error occurred while retrieving admin dashboard:', error);
    res.status(500).json({message: 'Server error'});
  }
});

// update user profile info
router.put('/user-dashboard-edit', isAuthenticated, async (req, res) => {
  try {
    const userId = req.payload._id;
    const {name, address, phoneNumber} = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {name, address, phoneNumber},
      {new: true}
    );

    if (!updatedUser) {
      return res.status(404).json({message: 'User not found'});
    }

    const updatedUserData = {
      name: updatedUser.name,
      address: updatedUser.address,
      phoneNumber: updatedUser.phoneNumber
    };

    res.json(updatedUserData);
  } catch (error) {
    console.log('An error occurred while updating user profile info:', error);
    res.status(500).json({message: 'Server error'});
  }
});

//  update admin profile info
router.put(
  '/admin-dashboard-edit',
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const userId = req.payload._id;
      const {name, address, phoneNumber} = req.body;

      const updatedAdmin = await User.findByIdAndUpdate(
        userId,
        {name, address, phoneNumber},
        {new: true}
      );

      if (!updatedAdmin) {
        return res.status(404).json({message: 'Admin not found'});
      }

      const updatedAdminData = {
        name: updatedAdmin.name,
        address: updatedAdmin.address,
        phoneNumber: updatedAdmin.phoneNumber
      };

      res.json(updatedAdminData);
    } catch (error) {
      console.log(
        'An error occurred while updating admin profile info:',
        error
      );
      res.status(500).json({message: 'Server error'});
    }
  }
);

// verify - use to check if the JWT stored on the client is valid
router.get('/verify', isAuthenticated, (req, res, next) => {
  // If the JWT is valid, it gets decoded and made available in req.payload
  // console.log('req.payload', req.payload);

  res.json(req.payload);
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

module.exports = router;
