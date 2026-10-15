require('dotenv').config();

// --- 1. Все require вверху ---
const express = require('express');
const { Contest } = require('./models');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const isAdmin = require('./middleware/isAdmin');

// --- 2. Создаём приложение ---
const app = express();
const port = 3000;

// --- 3. Middleware для парсинга JSON ---
app.use(express.json());

// --- 4. Маршруты аутентификации (/auth/register, /auth/login, /auth/profile) ---
app.use('/auth', authRoutes);

// --- 5. CRUD для конкурсов ---

// Чтение — доступно всем (даже без токена)
app.get('/contests', async (req, res, next) => {
  try {
    const contests = await Contest.findAll();
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

// Создание — только для админа
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

// Обновление — только для админа
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

// Удаление — только для админа
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

// --- 6. Обработка несуществующих маршрутов ---
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// --- 7. Глобальный обработчик ошибок ---
app.use((err, req, res, next) => {
  console.error('Ошибка:', err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// --- 8. Запуск сервера ---
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});