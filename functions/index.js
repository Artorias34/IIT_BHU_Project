const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Health Check
app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

// Add Medicine
app.post("/addMedicine", async (req, res) => {
  try {
    const { name, stock, price } = req.body;

    const doc = await db.collection("medicines").add({
      name,
      stock,
      price,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: "Added", id: doc.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Medicines
app.get("/getMedicines", async (req, res) => {
  try {
    const snapshot = await db.collection("medicines").get();
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

exports.api = functions.https.onRequest(app);