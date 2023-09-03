const jwt = require('jsonwebtoken');
const { getUserById } = require('./db'); 
const { requireUser } = require('./authUtils');



// Validate token and check for user authenticity
async function validateTokenAndUser(token) {
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);

    if (userId) {
      const user = await getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    }
  } catch (error) {
    throw error;
  }
}

// checks if a users has a token or not to access the server
const authMiddleware = async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.header('Authorization');

  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      const { userId } = jwt.verify(token, process.env.JWT_SECRET);

      if (userId) {
        req.user = await getUserById(userId);
        requireUser(req, res, next); // Check if the user is authenticated
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  } else {
    next({
      name: 'AuthorizationHeaderError',
      message: `Authorization token must start with ${prefix}`,
    });
  }
};

module.exports = authMiddleware;
