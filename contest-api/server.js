const cors = require('cors');
require('dotenv').config();
console.log('1. Env загружен');

const express = require('express');
const mongoose = require('mongoose');
const http = require('http');           
const { Server } = require('socket.io'); 
console.log('2. Библиотеки загружены');

const Contest = require('./models/mongo/contest'); 
console.log('3. Модель Contest загружена');

const authRoutes = require('./routes/auth');
console.log('4. Роуты авторизации загружены');
const authMiddleware = require('./middleware/auth');
const isAdmin = require('./middleware/isAdmin');
console.log('5. Middleware загружены');


const app = express();
const server = http.createServer(app);  
const io = new Server(server, {       
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const port = 3000;

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
  console.log('6. Вызов подключения к Mongo отправлен');

app.use('/auth', authRoutes);

io.on('connection', (socket) => {
  console.log('Пользователь подключился:', socket.id);

  socket.on('join_contest', (contestId) => {
    socket.join(contestId);
    console.log(`Socket ${socket.id} вошел в комнату ${contestId}`);

    socket.to(contestId).emit('user_joined', { 
      message: 'Новый пользователь присоединился к просмотру' 
    });
  });

  socket.on('leave_contest', (contestId) => {
    socket.leave(contestId);
    socket.to(contestId).emit('user_left', { 
      message: 'Пользователь покинул страницу' 
    });
  });

});

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
      { $push: { entries: req.body } }, 
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
      { $inc: { 'entries.$.votes': 1 } }, 
      { new: true }
    );
    
    if (!contest) {
      return res.status(404).json({ error: 'Конкурс или работа не найдены' });
    }

    const updatedEntry = contest.entries.find(
      (e) => e._id.toString() === req.params.entryId
    );

    io.to(req.params.id).emit('vote_updated', {
      entryId: req.params.entryId,
      votes: updatedEntry.votes
    });

    res.json(contest);
  } catch (err) {
    next(err);
  }
});

app.post('/contests/:id/tags', async (req, res, next) => {
  try {
    const contest = await Contest.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { tags: req.body.tag } }, 
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

server.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});