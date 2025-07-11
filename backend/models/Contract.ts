import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  buyOrSell: { type: String, enum: ['buy', 'sell'], required: true },
  optionType: { type: String, enum: ['call', 'put'], required: true },
  symbol: { type: String, trim: true, uppercase: true },
  expirationDate: { type: Date, required: true },
  strikePrice: { type: Number, required: true, min: 0 },
  breakeven: { type: Number, default: 0 },
  chanceOfProfit: { type: Number, min: 0, max: 100, default: 0 },
  bidPrice: { type: Number, min: 0, default: 0 },
  limitPrice: { type: Number, min: 0, default: 0 },
  contracts: { type: Number, required: true, min: 1, default: 1 },
  expectedCreditOrDebit: { type: Number, required: true },
  notes: { type: String, trim: true },
  status: { type: String, enum: ['open', 'closed', 'expired'], default: 'open' }
}, {
  timestamps: true
});

export default mongoose.model('Contract', contractSchema);