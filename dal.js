// const MongoClient = require('mongodb').MongoClient;
// // const url         = 'mongodb+srv://shelby:QHnd4CMyqg5lKJga@cluster1.yccoufm.mongodb.net/?retryWrites=true&w=majority';
// let db            = null;
// //  QHnd4CMyqg5lKJga


// // Connect to MongoDB Atlas with useUnifiedTopology option
// MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, client) {
//     if (err) {
//         console.error("Error connecting to MongoDB Atlas:", err);
//         return;
//     }
//     console.log("Connected successfully to MongoDB Atlas");

//     // Connect to your database (replace 'myproject' with your actual database name)
//     db = client.db('myproject');
// });



const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODB_URI || 'mongodb+srv://shelby:QHnd4CMyqg5lKJga@cluster1.yccoufm.mongodb.net/?retryWrites=true&w=majority'; // Use the environment variable
let db = null;

// Connect to MongoDB Atlas with useUnifiedTopology option
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function(err, client) {
    if (err) {
        console.error("Error connecting to MongoDB Atlas:", err);
        return;
    }
    console.log("Connected successfully to MongoDB Atlas");

    // Connect to your database (replace 'myproject' with your actual database name)
    db = client.db('myproject');
});

// ...rest of your code for creating, finding, and updating users


// create user account
function create(name, email, password){
    return new Promise((resolve, reject) => {    
        const collection = db.collection('users');
        const doc = {name, email, password, balance: 0};
        collection.insertOne(doc, {w:1}, function(err, result) {
            err ? reject(err) : resolve(doc);
        });    
    })
}

// find user account
function find(email){
    return new Promise((resolve, reject) => {    
        const customers = db
            .collection('users')
            .find({email: email})
            .toArray(function(err, docs) {
                err ? reject(err) : resolve(docs);
        });    
    })
}

// find user account
function findOne(email){
    return new Promise((resolve, reject) => {    
        const customers = db
            .collection('users')
            .findOne({email: email})
            .then((doc) => resolve(doc))
            .catch((err) => reject(err));    
    })
}

// update - deposit/withdraw amount
function update(email, amount){
    return new Promise((resolve, reject) => {    
        const customers = db
            .collection('users')            
            .findOneAndUpdate(
                {email: email},
                { $inc: { balance: amount}},
                { returnOriginal: false },
                function (err, documents) {
                    err ? reject(err) : resolve(documents);
                }
            );            


    });    
}

// all users
function all(){
    return new Promise((resolve, reject) => {    
        const customers = db
            .collection('users')
            .find({})
            .toArray(function(err, docs) {
                err ? reject(err) : resolve(docs);
        });    
    })
}


module.exports = {create, findOne, find, update, all};