// const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();
require("dotenv").config();
const express = require('express');
const app = express();
const authMiddleware = require('./authMiddleware');
const cors = require('cors');
const db = require('./db.js');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const { requireUser } = require('./authUtils');
//////////////////////////////////////////////////////////////////

// Initialize Firebase Admin SDK
const serviceAccount = require('./authJSON.json'); // Replace with your service account key
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://test-8a648-default-rtdb.firebaseio.com' // Replace with your Firebase project URL
});

//APP USE
app.use(morgan('dev'));
app.use(cors());
app.use(express.json())
app.use(authMiddleware); 


// Authentication route for token verification (unchanged)
app.get('/auth', function (req, res) {
  // read token from header
  const idToken = req.headers.authorization;
  console.log('header:', idToken);

  if (!idToken) {
      res.status(401).send();
      return;
  }

  // verify token, is this token valid?
  admin.auth().verifyIdToken(idToken)
      .then(function (decodedToken) {
          console.log('decodedToken:', decodedToken);
          res.send('Authentication Success!');
      }).catch(function (error) {
          console.log('error:', error);
          res.status(401).send('Token invalid!');
      });
});



// HEATH ROUTE
app.get('/', async (req, res, next) => {
    try {
        res.status(200).json({
            uptime: process.uptime(),
            message: 'All is well',
            timestamp: Date.now()
        });
    } catch (error) {
        next(error); // Pass the error to the error handler middleware
    }
});

// Handle the POST request to store user data
app.post('/store', async (req, res) => {
    try {
      const { email } = req.body;
  
      // Check if the user with this email already exists in the database
      const existingUser = await findOne(email);
  
      if (existingUser) {
        // User already exists, no need to create a new one
        res.status(200).json({ message: "User already exists in the database." });
      } else {
        // User doesn't exist, create a new user with initial balance 0
        const newUser = await db.create(email, 0); // Pass balance as 0
  
        res.status(201).json({ message: "User data stored successfully.", user: newUser });
      }
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  
  


// Create user account using Firebase Authentication and store user data in MongoDB
app.post('/account/create', async (req, res) => {
  try {
      const { name, email, password } = req.body;

      // Create the user in Firebase Authentication
      admin.auth().createUser({
          displayName: name,
          email: email,
          password: password
      }).then(async (userRecord) => {
          const { uid } = userRecord;
          
          // Store user data in MongoDB
          const hashedPassword = await bcrypt.hash(password, 10);
          await db.create(name, email, hashedPassword, uid);

          res.status(201).json({ user: userRecord });
      }).catch((error) => {
          console.error('Firebase Authentication Error:', error);
          res.status(500).send('Internal Server Error');
      });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
  }
});

// // Log in user using Firebase Authentication
// app.post('/account/login', async (req, res) => {
//   try {
//       const { email, password } = req.body;

//       // Sign in the user with Firebase Authentication
//       admin.auth().signInWithEmailAndPassword(email, password)
//           .then((userCredential) => {
//               const user = userCredential.user;
//               res.json({ user });
//           })
//           .catch((error) => {
//               console.error('Firebase Authentication Error:', error);
//               res.status(401).json({ message: 'Login failed: ' + error.message });
//           });
//   } catch (error) {
//       console.error('Error:', error);
//       res.status(500).send('Internal Server Error');
//   }
// });




// find user account
app.get('/account/find/:email', async (req, res) => {
    try {
        const user = await db.find(req.params.email);
        res.send(user);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// find one user by email - alternative to find
app.get('/account/findOne/:email', async (req, res) => {
    try {
        const user = await db.findOne(req.params.email);
        res.send(user);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// update - deposit/withdraw amount
app.get('/account/update/:email/:amount',  async (req, res) => {
    try {
        const amount = Number(req.params.amount);
        const response = await db.update(req.params.email, amount);
        res.send(response);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// all accounts
app.get('/account/all', async (req, res) => {
    try {
        const docs = await db.all();
        res.send(docs);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// Retrieve user data using token
app.get("/me", async (req, res, next) => {
    const user = req.user;
    res.send(user);
    next;
  });


 app.get('/account/id/:userId', async (req, res) => {
    try {
        const user = await db.getUserById(req.params.userId);
        res.json(user); // Send the user data as JSON response
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

//PORT 
const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log(`Running on port ${port}`);
});