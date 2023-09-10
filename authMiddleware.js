const jwt = require('jsonwebtoken');
const { getUserById } = require('./db'); 
const { requireUser } = require('./authUtils');



const authMiddleware = async (req, res, next) => {
  const prefix = 'Bearer ';
  const auth = req.headers['authorization'];

  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    const token = auth.slice(prefix.length);

    try {
      const { userId } = jwt.verify(token, process.env.JWT_SECRET);

      if (!userId) {
       
        next();
      
      } else{
        req.user = await getUserById(userId);
        next();
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