require("dotenv").config();
const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./db.js');

// Middleware
app.use(cors());

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

// create user account
app.get('/account/create/:name/:email/:password', async (req, res) => {
    try {
        const users = await db.find(req.params.email);

        if (users.length > 0) {
            console.log('User already exists');
            res.send('User already exists');
        } else {
            const user = await db.create(req.params.name, req.params.email, req.params.password);
            console.log(user);
            res.send(user);
        }
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

// login user
app.get('/account/login/:email/:password', async (req, res) => {
    try {
        const user = await db.find(req.params.email);

        if (user.length > 0) {
            if (user[0].password === req.params.password) {
                res.send(user[0]);
            } else {
                res.send('Login failed: wrong password');
            }
        } else {
            res.send('Login failed: user not found');
        }
    } catch (error) {
        res.status(500).send('Internal Server Error');
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

const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log(`Running on port ${port}`);
});
