const admin = require("firebase-admin");
const jwt = require('jsonwebtoken');
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
const serviceAccount = require("./serviceAccountKey.json");

//////////////////////////////////////////////////////////////////

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://test-8a648-default-rtdb.firebaseio.com"
  });


//APP USE
app.use(morgan('dev'));
app.use(cors());
app.use(express.json())
app.use(authMiddleware); 




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


// ACCESST TOKENS
const shortExpiry = process.env.short_token; // Example: short-lived token expires after 10 seconds
const longExpiry = process.env.long_token;   // Example: refresh token expires after 5 hours


// Generate a short-lived access token
function generateShortToken(user) {
    const payload = {
        userId: user.id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: shortExpiry });
    return token;
}


// Generate a long-lived refresh token
function generateRefreshToken(user) {
    const payload = {
        userId: user.id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: longExpiry });
    return token;
}

// Registration using Firebase Auth
app.post('/account/create', async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      // Create user using Firebase Authentication
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });
  
      // Store additional user data in MongoDB
      const user = await db.create(name, email, userRecord.uid);
  
      const shortToken = generateShortToken(user);
      const refreshToken = generateRefreshToken(user);
  
      res.status(201).json({ user, shortToken, refreshToken });
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
  
// Login using Firebase Auth
app.post('/account/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Authenticate the user with Firebase Authentication
      const userCredential = await admin
        .auth()
        .signInWithEmailAndPassword(email, password);
  
      // Get user data from MongoDB
      const user = await db.findOne(email);
  
      if (user) {
        const shortToken = generateShortToken(user);
        const refreshToken = generateRefreshToken(user);
        res.json({ user, shortToken, refreshToken });
      } else {
        res.status(401).json({ message: 'Login failed: user not found' });
      }
    } catch (error) {
      res.status(401).json({ message: 'Login failed: invalid credentials' });
    }
  });






// find user account
app.get('/account/find/:email', async (req, res) => {
    try {
        const user = await db.find(req.params.email);
        console.log(user);
        res.send(user);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// find one user by email - alternative to find
app.get('/account/findOne/:email', async (req, res) => {
    try {
        const user = await db.findOne(req.params.email);
        console.log(user);
        res.send(user);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// update - deposit/withdraw amount
app.get('/account/update/:email/:amount', async (req, res) => {
    try {
        const amount = Number(req.params.amount);
        const response = await db.update(req.params.email, amount);
        console.log(response);
        res.send(response);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// find one user by email - alternative to find
app.get("/account/id/:userId", async (req, res) => {
    try {
      const user = await db.getUserById(req.params.userId);
      console.log(user);
      res.json(user);
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  });

// all accounts
app.get('/account/all', async (req, res) => {
    try {
        const docs = await db.all();
        console.log(docs);
        res.send(docs);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});


//PORT 
const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log(`Running on port ${port}`);
});
