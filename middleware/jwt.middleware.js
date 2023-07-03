const { expressjwt: jwt } = require('express-jwt');

// Instantiate the jwt token validation middleware
const isAuthenticated = jwt({
  secret: process.env.TOKEN_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'payload', // we'll acess the decoded in req.payload
  getToken: getTokenFromHeaders // the function to extract the jwt
});

//checks if the token is on the request headers
// has yhe following format
/* const request = {
  headers: { authorization: 'Bearer huguhuukubjkbu' }
}; */

// the function passed in the getToken property above
function getTokenFromHeaders(req) {
  // checks if the token is on the request headers
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

// exports the midleware to use it in protected routes
module.exports = { isAuthenticated };
