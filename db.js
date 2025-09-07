const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let database;

const connectDB = async () => {
    try {
        await client.connect();
        database = client.db('inventoryDB');
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.error("❌ MongoDB Connection Failed", err);
        process.exit(1);
    }
};

const getDB = () => database;

module.exports = { connectDB, getDB };
