const firebaseAdmin = require('firebase-admin');

// Middleware to check if a user is authenticated
function requireAuth(req, res, next) {
  const idToken = req.header('Authorization').split(' ')[1]; // Extract the token from the header
  if (!idToken) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  firebaseAdmin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.user = decodedToken;
      next(); // User is authenticated, continue to the route handler
    })
    .catch((error) => {
      console.error('Firebase authentication error:', error);
      return res.status(401).json({ message: 'Unauthorized' });
    });
}

module.exports = { requireAuth };
