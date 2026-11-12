const cors = require('cors');
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const Contest = require('./models/mongo/contest'); 

const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const isAdmin = require('./middleware/isAdmin');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/auth', authRoutes);

app.get('/contests', async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    const contests = await Contest.find(query);
    res.json(contests);
  } catch (err) {
    next(err);
  }
});

app.get('/contests/:id', async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ error: 'Конкурс не найден' });
    }
    res.json(contest);
  } catch (err) {
    next(err);
  }
});

app.post('/contests', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Название и описание обязательны' });
    }

    const newContest = await Contest.create(req.body);
    res.status(201).json(newContest);
  } catch (err) {
    next(err);
  }
});

app.put('/contests/:id', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Название и описание обязательны' });
    }

    // Аналог findByPk + update в Mongoose (new: true возвращает обновленный объект)
    const contest = await Contest.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    if (!contest) {
      return res.status(404).json({ error: 'Конкурс не найден' });
    }

    res.json(contest);
  } catch (err) {
    next(err);
  }
});

app.delete('/contests/:id', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);
    
    if (!contest) {
      return res.status(404).json({ error: 'Конкурс не найден' });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

app.post('/contests/:id/entries', async (req, res, next) => {
  try {
    const contest = await Contest.findByIdAndUpdate(
      req.params.id,
      { $push: { entries: req.body } }, // $push добавляет элемент в массив
      { new: true, runValidators: true }
    );
    if (!contest) {
      return res.status(404).json({ error: 'Конкурс не найден' });
    }
    res.status(201).json(contest);
  } catch (err) {
    next(err);
  }
});

app.post('/contests/:id/entries/:entryId/vote', async (req, res, next) => {
  try {
    const contest = await Contest.findOneAndUpdate(
      { _id: req.params.id, 'entries._id': req.params.entryId },
      { $inc: { 'entries.$.votes': 1 } }, // $inc увеличивает значение, а $ указывает на нужный элемент массива
      { new: true }
    );
    if (!contest) {
      return res.status(404).json({ error: 'Конкурс или работа не найдены' });
    }
    res.json(contest);
  } catch (err) {
    next(err);
  }
});

app.post('/contests/:id/tags', async (req, res, next) => {
  try {
    const contest = await Contest.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { tags: req.body.tag } }, // $addToSet добавляет, только если такого тега еще нет
      { new: true }
    );
    if (!contest) {
      return res.status(404).json({ error: 'Конкурс не найден' });
    }
    res.json(contest);
  } catch (err) {
    next(err);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

app.use((err, req, res, next) => {
  console.error('Ошибка:', err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});