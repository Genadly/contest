const cors = require('cors');
require('dotenv').config();

const express = require('express');
const { Contest } = require('./models');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const isAdmin = require('./middleware/isAdmin');

const { Op } = require('sequelize');
const app = express();
const port = 3000;


app.use(express.json());
app.use(cors());


app.use('/auth', authRoutes);


app.get('/contests', async (req, res, next) => {
  try {
    const { search } = req.query;
    const where = {};
    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }
    const contests = await Contest.findAll({ where });
    res.json(contests);
  } catch (err) {
    next(err);
  }
});

app.get('/contests/:id', async (req, res, next) => {
  try {
    const contest = await Contest.findByPk(req.params.id);
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
    const contest = await Contest.findByPk(req.params.id);
    if (!contest) {
      return res.status(404).json({ error: 'Конкурс не найден' });
    }

    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Название и описание обязательны' });
    }

    await contest.update(req.body);
    res.json(contest);
  } catch (err) {
    next(err);
  }
});


app.delete('/contests/:id', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const contest = await Contest.findByPk(req.params.id);
    if (!contest) {
      return res.status(404).json({ error: 'Конкурс не найден' });
    }

    await contest.destroy();
    res.status(204).send();
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