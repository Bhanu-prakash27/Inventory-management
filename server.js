require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

    const itemSchema = new mongoose.Schema({
  name: String,
  quantity: Number
});

const Item = mongoose.model('Item', itemSchema);
// ✅ Define Transaction Schema
const transactionSchema = new mongoose.Schema({
  product: String,
  quantity: Number,
  date: Date,
  type: String,
  price:{type:Number,default:0} 
}, { timestamps: true });





const Transaction = mongoose.model('Transaction', transactionSchema);

// ✅ Fetch Last 10 Transactions
app.get('/transactions', async (req, res) => {
    try {
        const { sort } = req.query;
        const sortOrder = sort === "oldest" ? { date: 1 } : { date: -1 };

        const transactions = await Transaction.find().sort(sortOrder);
        res.json(transactions);
    } catch (error) {
        console.error("❌ Error fetching transactions:", error);
        res.status(500).json({ error: "Error fetching transactions" });
    }
});

// ✅ Add New Transaction (Fixes Missing POST API)
app.post('/transactions', async (req, res) => {
    try {
        const { product, quantity, date, type, price } = req.body;

        // ✅ Check stock before adding a "sales" transaction
        if (type === "sales") {
            const purchases = await Transaction.aggregate([
                { $match: { product, type: "purchase" } },
                { $group: { _id: null, totalPurchased: { $sum: "$quantity" } } }
            ]);

            const sales = await Transaction.aggregate([
                { $match: { product, type: "sales" } },
                { $group: { _id: null, totalSold: { $sum: "$quantity" } } }
            ]);

            const totalPurchased = purchases.length > 0 ? purchases[0].totalPurchased : 0;
            const totalSold = sales.length > 0 ? sales[0].totalSold : 0;
            const availableStock = totalPurchased - totalSold;

            console.log(`🔍 Checking stock: Purchased = ${totalPurchased}, Sold = ${totalSold}, Available = ${availableStock}`);

            if (quantity > availableStock) {
                return res.status(400).json({ error: `❌ Insufficient stock! Available: ${availableStock}, Requested: ${quantity}` });
            }
        }

        // ✅ If purchase or enough stock for sale, add transaction
        const transaction = new Transaction({ product, quantity, date: new Date(date), type, price });
        await transaction.save();

        res.json({ message: "✅ Transaction added successfully!", transaction });
    } catch (error) {
        console.error("❌ Error saving transaction:", error); // ✅ Show exact error
        res.status(500).json({ error: "Error saving transaction" });
    }
});




// ✅ Filter Transactions by Type & Date Range
app.get('/transactions/filter', async (req, res) => {
    try {
        const { type, startDate, endDate, product, sort } = req.query;
        let filter = {};

        if (type && type !== "all") filter.type = type;
        if (startDate && endDate) filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
        if (product) filter.product = new RegExp(`\\b(${product})\\b`, "i");

        // ✅ Sorting Logic
        const sortOrder = sort === "oldest" ? { date: 1 } : { date: -1 };

        const transactions = await Transaction.find(filter).sort(sortOrder);
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: "Error filtering transactions" });
    }
});




// ✅ Check Product Availability
app.get('/product-availability', async (req, res) => {
    try {
        const { product } = req.query;

        const purchases = await Transaction.aggregate([
            { $match: { product: product, type: "purchase" } },
            { $group: { _id: null, totalPurchased: { $sum: "$quantity" } } }
        ]);

        const sales = await Transaction.aggregate([
            { $match: { product: product, type: "sales" } },
            { $group: { _id: null, totalSold: { $sum: "$quantity" } } }
        ]);

        const totalPurchased = purchases.length > 0 ? purchases[0].totalPurchased : 0;
        const totalSold = sales.length > 0 ? sales[0].totalSold : 0;
        const availableStock = totalPurchased - totalSold;

        let message = "✅ Stock Available";
        if (availableStock < 5) {
            message = `⚠️ Low Stock! Only ${availableStock} left.`;
        }

        res.json({ product, availableStock, message });
    } catch (error) {
        console.error("❌ Error checking product availability:", error);
        res.status(500).json({ error: "Error checking product availability" });
    }
});



// ✅ Start Server
app.listen(3000, () => console.log("🚀 Server running on port 3000"));

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const users = [{ username: "admin", password: bcrypt.hashSync("password", 10) }];

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ username }, "secret_key", { expiresIn: "1h" });
    res.json({ token });
});

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "❌ Unauthorized: No token provided" });

    try {
        jwt.verify(token, "secret_key");
        next();
    } catch {
        res.status(403).json({ error: "❌ Invalid token" });
    }
};


// Protect inventory routes
app.get("/items", authenticate, async (req, res) => {
    try {
        const items = await Item.find();
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: "Error fetching items" });
    }
});


app.delete('/transactions/delete-multiple', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: "❌ No valid transaction IDs provided" });
        }

        const result = await Transaction.deleteMany({ _id: { $in: ids } });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "❌ No transactions found to delete" });
        }

        res.json({ message: `✅ Successfully deleted ${result.deletedCount} transaction(s).` });
    } catch (error) {
        console.error("❌ Error deleting transactions:", error);
        res.status(500).json({ error: "❌ Failed to delete transactions." });
    }
});


// ✅ Get Total Sales & Purchases
app.get('/transactions/totals', async (req, res) => {
    try {
        const totalSales = await Transaction.aggregate([
            { $match: { type: "sales" } },
            { $group: { _id: null, total: { $sum: { $multiply: ["$quantity", "$price"] } } } }
        ]);

        const totalPurchases = await Transaction.aggregate([
            { $match: { type: "purchase" } },
            { $group: { _id: null, total: { $sum: { $multiply: ["$quantity", "$price"] } } } }
        ]);

        res.json({
            totalSales: totalSales.length > 0 ? totalSales[0].total : 0,
            totalPurchases: totalPurchases.length > 0 ? totalPurchases[0].total : 0
        });
    } catch (error) {
        console.error("❌ Error fetching totals:", error);
        res.status(500).json({ error: "❌ Error fetching total sales and purchases" });
    }
});



const path = require("path");

app.use(express.static(__dirname)); // ✅ Serve files from the current folder

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html")); // ✅ Loads login.html directly
});

app.post('/addItem', async (req, res) => {
  const { product, quantity, price, type, date } = req.body;

  try {
    if (!product || !quantity || !price || !type) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const name = product.toLowerCase().trim();
    const normalizedName = name.endsWith('s') ? name.slice(0, -1) : name; // ✅ Remove trailing 's'
    const qty = parseInt(quantity);
    const totalPrice = parseFloat(price);

    // Validate type
    if (type !== "purchase" && type !== "sale") {
      return res.status(400).json({ success: false, message: "Invalid transaction type" });
    }

    // Get or create item
    let item = await Item.findOne({ name: normalizedName });

    // Check stock before sale
    if (type === "sale") {
      if (!item || item.quantity < qty) {
        return res.status(400).json({
          success: false,
          message: `❌ Not enough stock of "${normalizedName}" to sell. Available: ${item?.quantity || 0}`
        });
      }
      // Subtract stock
      item.quantity -= qty;
    } else {
      // For purchase, add to stock
      if (!item) {
        item = new Item({ name: normalizedName, quantity: 0 });
      }
      item.quantity += qty;
    }

    await item.save(); // ✅ Save updated stock

    // Save transaction
    await Transaction.create({
      product: normalizedName,
      quantity: qty,
      price: totalPrice,
      type,
      date: date || new Date()
    });

    res.json({ success: true, message: `✅ ${type === "sale" ? "Sale" : "Purchase"} recorded` });

  } catch (err) {
    console.error("❌ Backend error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});




app.get('/transactions', async (req, res) => {
  try {
    const sortOption = req.query.sort === 'newest' ? -1 : 1;
    const transactions = await Item.find().sort({ _id: sortOption });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


