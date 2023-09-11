const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
require("dotenv").config();
const express = require("express");
const app = express();
const authMiddleware = require("./authMiddleware");
const cors = require("cors");
const db = require("./db.js");
const morgan = require("morgan");
const bcrypt = require("bcrypt");
const { requireUser } = require("./authUtils");
//////////////////////////////////////////////////////////////////

//APP USE
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(authMiddleware);

// HEATH ROUTE
app.get("/", async (req, res, next) => {
  try {
    res.status(200).json({
      uptime: process.uptime(),
      message: "All is well",
      timestamp: Date.now(),
    });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
});

// ACCESST TOKENS
// const shortExpiry = process.env.short_token; // Example: short-lived token expires after 10 seconds
// const longExpiry = process.env.long_token;   // Example: refresh token expires after 5 hours

// Generate a short-lived access token
// function generateShortToken(user) {
//     const payload = {
//         userId: user.id,
//     };
//     const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: shortExpiry });
//     return token;
// }

// Generate a long-lived refresh token
// function generateRefreshToken(user) {
//     const payload = {
//         userId: user.id,
//     };
//     const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: longExpiry });
//     return token;
// }

// user creation route to return both tokens

//Single TOKEN
// Generate a single access token with a longer expiration time
function generateAccessToken(user) {
  const payload = {
    userId: user.id,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" });
  return token;
}

//Register
app.post("/account/create", async (req, res) => {
  try {
    const { name, email, password, pin } = req.body;

    const users = await db.find(email);

    if (users.length > 0) {
      console.log("User already exists");
      res.status(400).send("User already exists");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
      const hashedPin = await bcrypt.hash(pin.toString(), 10); // Hash the PIN

      const user = await db.create(name, email, hashedPassword, hashedPin); // Store the hashed password and PIN
      const accessToken = generateAccessToken(user); // Generate a single access token
      res.status(201).json({ user, accessToken });
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});




//Get ME Endpoint
app.get('/me', async (req, res, next) => {
    const user = req.user;
    console.log('test user 119',user);
    res.json(user); // Send the user as JSON response

});

app.post("/account/check-pin", async (req, res) => {
    try {
      const { email, pin } = req.body;
      const user = await db.findOne(email);
  
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
  
      // Compare the provided PIN with the user's stored PIN
      if (pin === user.pin) {
        res.json({ balance: user.balance });
      } else {
        res.status(401).json({ message: "PIN does not match" });
      }
    } catch (error) {
      console.error("Error checking PIN:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  

//LOGIN
app.post("/account/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.findOne(email);

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        const accessToken = generateAccessToken(user);
        res.json({ user, accessToken });
      } else {
        res.status(401).json({ message: "Login failed: wrong password" });
      }
    } else {
      res.status(401).json({ message: "Login failed: user not found" });
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// find user account
app.get("/account/find/:email", async (req, res) => {
  try {
    const user = await db.find(req.params.email);
    res.send(user);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// find one user by email - alternative to find
app.get("/account/findOne/:email", async (req, res) => {
  try {
    const user = await db.findOne(req.params.email);
    res.send(user);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// update - deposit/withdraw amount
app.get("/account/update/:email/:amount", async (req, res) => {
  try {
    const amount = Number(req.params.amount);
    const response = await db.update(req.params.email, amount);
    console.log(response);
    res.send(response);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// all accounts
app.get("/account/all", async (req, res) => {
  try {
    const docs = await db.all();
    res.send(docs);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/account/id/:userId", async (req, res) => {
  try {
    const user = await db.getUserById(req.params.userId);
    res.json(user); // Send the user data as JSON response
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.use("*", (req, res) => {
  res.status(404).send({
    error: "unknownpage",
    name: "badURL",
    message: "wrong route",
  });
});

app.use((error, req, res, next) => {
  res.send({
    error: error.error,
    name: error.name,
    message: error.message,
  });
});

const isTestEnvironment = process.env.NODE_ENV === "test";

//PORT
const port = process.env.PORT || 3000;
app.listen(port, function () {
  if (!isTestEnvironment) {
    console.log("Running on port 3000");
  }
});