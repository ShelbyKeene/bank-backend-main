// const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();
require("dotenv").config();
const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./db.js');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const { requireAuth } = require('./authUtils');
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
// app.use(verifyToken); 



  



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






// find user account
app.get('/account/find/:email', requireAuth, async (req, res) => {
    try {
        const user = await db.find(req.params.email);
        res.send(user);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});


// find one user by email - alternative to find
app.get('/account/findOne/:email',requireAuth, async (req, res) => {
    try {
        const user = await db.findOne(req.params.email);
        res.send(user);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});


// update - deposit/withdraw amount
app.get('/account/update/:email/:amount',requireAuth, async (req, res) => {
    try {
        const amount = Number(req.params.amount);
        const response = await db.update(req.params.email, amount);
        res.send(response);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});


// all accounts
app.get('/account/all',requireAuth, async (req, res) => {
    try {
        const docs = await db.all();
        res.send(docs);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});


// // Retrieve user data using token
// app.get("/me",requireUser, async (req, res, next) => {
//     const user = req.user;
//     res.send(user);
//     next;
//   });


  // get a user by ID
 app.get('/account/id/:userId',requireAuth, async (req, res) => {
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