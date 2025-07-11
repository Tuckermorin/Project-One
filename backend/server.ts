import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Contract from './models/Contract';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/options-tracker')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Get all contracts
app.get('/api/contracts', async (req, res) => {
  try {
    const contracts = await Contract.find().sort({ createdAt: -1 });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

// Create contract
app.post('/api/contracts', async (req, res) => {
  try {
    const contract = new Contract(req.body);
    await contract.save();
    res.status(201).json(contract);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create contract' });
  }
});

// Delete contract
app.delete('/api/contracts/:id', async (req, res) => {
  try {
    await Contract.findByIdAndDelete(req.params.id);
    res.json({ message: 'Contract deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contract' });
  }
});

// Update contract
app.put('/api/contracts/:id', async (req, res) => {
  try {
    const contract = await Contract.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contract' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});