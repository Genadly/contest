const express = require('express');
const app = express();
const port = 3000;  

app.use(express.json());

let contests = [];
let nextId = 1;

app.get('/contests', (req, res) => {
  res.json(contests);
});

app.get('/contests/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const contest = contests.find(c => c.id === id);
  if (!contest) {
    return res.status(404).json({ error: 'Конкурс не найден' });
  }
  res.json(contest);
});

app.post('/contests', (req, res) => {
  const { title, description, startDate, endDate, status } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Название и описание обязательны' });
  }

  const newContest = {
    id: nextId++,
    title,
    description,
    startDate: startDate || null,
    endDate: endDate || null,
    status: status || 'draft'   
  };

  contests.push(newContest);
  res.status(201).json(newContest);
});

app.put('/contests/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = contests.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Конкурс не найден' });
  }

  const { title, description, startDate, endDate, status } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Название и описание обязательны' });
  }

  contests[index] = {
    id,
    title,
    description,
    startDate: startDate || null,
    endDate: endDate || null,
    status: status || 'draft'
  };

  res.json(contests[index]);
});

app.delete('/contests/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = contests.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Конкурс не найден' });
  }

  contests.splice(index, 1);
  res.status(204).send();   
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