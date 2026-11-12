const mongoose = require('mongoose');

// Схема для вложенного документа «Работа»
const entrySchema = new mongoose.Schema({
  author: { type: String, required: true },
  photoUrl: { type: String, required: true },
  votes: { type: Number, default: 0 },
  submittedAt: { type: Date, default: Date.now }
});

// Схема для вложенного документа «Комментарий»
const commentSchema = new mongoose.Schema({
  author: String,
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Основная схема «Конкурс»
const contestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true }, // <- Вернули
  endDate: { type: Date, required: true },   // <- Вернули
  status: { type: String, enum: ['draft', 'active', 'finished'], default: 'draft' },
  tags: [String],                        // массив строк
  entries: [entrySchema],                // массив вложенных документов
  comments: [commentSchema],             // массив вложенных документов
  createdAt: { type: Date, default: Date.now }
});

const Contest = mongoose.model('Contest', contestSchema);

module.exports = Contest;