// Middleware to check if the user has admin role
const isAdmin = (req, res, next) => {
    const user = req.payload;
    
    if (user.role === 'admin') {
        
      next(); 
    } else {
      res.status(403).json({ message: 'Access denied. You do not have admin privileges.' });
    }
  };
  
  module.exports = { isAdmin };