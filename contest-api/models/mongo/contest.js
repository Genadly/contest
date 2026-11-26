const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  author: { type: String, required: true },
  photoUrl: { type: String, required: true },
  votes: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now }
});

const commentSchema = new mongoose.Schema({
  author: String,
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const contestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true }, 
  endDate: { type: Date, required: true },   
  status: { type: String, enum: ['draft', 'active', 'finished'], default: 'draft' },
  tags: [String],                        
  entries: [entrySchema],                
  comments: [commentSchema],            
  createdAt: { type: Date, default: Date.now }
});

const Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest;