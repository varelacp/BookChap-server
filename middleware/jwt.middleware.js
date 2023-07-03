const { expressjwt: jwt } = require('express-jwt');

// instatiate JWT Token validation middlewware
const isAuthenticated = jwt({
  secret: process.env.TOKEN_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'payload', // we'll access the decoded jwt in req.payload
  getToken: getTokenFromHeaders // the function to extract the jwt
});

// the function passed in the getToken propeerty above
function getTokenFromHeaders(req) {
  // has the following format:
  // const request = {
  //   headers: {
  //     authorization: 'Bearer aksjhgkahrgkhsdfçkjhçk'
  //   }
  // }

  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    const token = req.headers.authorization.split(' ')[1];
    return token;
  }
  return null;
}

// exports the middleware to use it in the protected routes
module.exports = { isAuthenticated };
