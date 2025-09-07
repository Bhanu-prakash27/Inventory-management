const express = require('express');
const { connectDB, getDB } = require('./db');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Connect to the database
connectDB();

// Create a new item
app.post('/items', async (req, res) => {
    const { name, description, quantity, price } = req.body;

    if (!name || !description || quantity === undefined || price === undefined) {
        return res.status(400).send("Missing required fields");
    }

    const db = getDB();
    const itemsCollection = db.collection('items');

    try {
        const newItem = {
            name,
            description,
            quantity,
            price,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await itemsCollection.insertOne(newItem);
        res.status(201).json(result.ops[0]);
    } catch (err) {
        res.status(500).send("Error creating item");
    }
});

// Get all items
app.get('/items', async (req, res) => {
    const db = getDB();
    const itemsCollection = db.collection('items');

    try {
        const items = await itemsCollection.find().toArray();
        res.json(items);
    } catch (err) {
        res.status(500).send("Error fetching items");
    }
});

// Get item by ID
app.get('/items/:id', async (req, res) => {
    const db = getDB();
    const itemsCollection = db.collection('items');
    const { id } = req.params;

    try {
        const item = await itemsCollection.findOne({ _id: new require('mongodb').ObjectId(id) });
        if (!item) {
            return res.status(404).send("Item not found");
        }
        res.json(item);
    } catch (err) {
        res.status(500).send("Error fetching item");
    }
});

// Update item
app.put('/items/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, quantity, price } = req.body;

    const db = getDB();
    const itemsCollection = db.collection('items');

    try {
        const updatedItem = {
            name,
            description,
            quantity,
            price,
            updatedAt: new Date(),
        };

        const result = await itemsCollection.updateOne(
            { _id: new require('mongodb').ObjectId(id) },
            { $set: updatedItem }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send("Item not found");
        }

        res.json(updatedItem);
    } catch (err) {
        res.status(500).send("Error updating item");
    }
});

// Delete item
app.delete('/items/:id', async (req, res) => {
    const { id } = req.params;

    const db = getDB();
    const itemsCollection = db.collection('items');

    try {
        const result = await itemsCollection.deleteOne({ _id: new require('mongodb').ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).send("Item not found");
        }

        res.status(204).send();
    } catch (err) {
        res.status(500).send("Error deleting item");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
