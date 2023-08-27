const MongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODB_URI || 'mongodb+srv://shelby:QHnd4CMyqg5lKJga@cluster1.yccoufm.mongodb.net/?retryWrites=true&w=majority';
let db = null;

// Connect to MongoDB Atlas with useUnifiedTopology option
(async () => {
    try {
        const client = await MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected successfully to MongoDB Atlas");
        db = client.db('myproject');
    } catch (error) {
        console.error("Error connecting to MongoDB Atlas:", error);
    }
})();

// create user account
async function create(name, email, password) {
    try {
        const collection = db.collection('users');
        const doc = { name, email, password, balance: 0 };
        const result = await collection.insertOne(doc);
        return doc;
    } catch (error) {
        throw error;
    }
}

// find user account
async function find(email) {
    try {
        const customers = await db
            .collection('users')
            .find({ email: email })
            .toArray();
        return customers;
    } catch (error) {
        throw error;
    }
}

// find one user by email - alternative to find
async function findOne(email) {
    try {
        const doc = await db
            .collection('users')
            .findOne({ email: email });
        return doc;
    } catch (error) {
        throw error;
    }
}

// update - deposit/withdraw amount
async function update(email, amount) {
    try {
        const documents = await db
            .collection('users')
            .findOneAndUpdate(
                { email: email },
                { $inc: { balance: amount } },
                { returnOriginal: false }
            );
        return documents;
    } catch (error) {
        throw error;
    }
}

// all users
async function all() {
    try {
        const docs = await db
            .collection('users')
            .find({})
            .toArray();
        return docs;
    } catch (error) {
        throw error;
    }
}

module.exports = { create, findOne, find, update, all };
