import styles from './ContestList.module.css';
import { useState, useEffect } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import ContestForm from './ContestForm';
import ContestItem from './ContestItem';

const INITIAL_CONTESTS = [
  { id: 1, title: 'Фотоконкурс «Лето 2026»', description: 'Лучшие летние снимки', status: 'active' },
  { id: 2, title: 'Конкурс «Зимний пейзаж»', description: 'Голосование за зимнее фото', status: 'draft' }
];

export default function ContestList() {
  // 1. Массив конкурсов в localStorage
  const [contests, setContests] = useLocalStorage('contests', INITIAL_CONTESTS);

  // 2. Состояние фильтра
  const [filter, setFilter] = useState('all');

  // 3. Состояние «идёт загрузка»
  const [loading, setLoading] = useState(true);

  // 4. Имитация загрузки с сервера (1 секунда)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);   // очистка при размонтировании
  }, []);

  // 5. Изменение заголовка страницы при изменении количества конкурсов
  useEffect(() => {
    document.title = `Конкурсов: ${contests.length}`;
  }, [contests.length]);

  // 6. Debounce-автосохранение (демонстрация, 500 мс)
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Автосохранение выполнено:', contests.length);
    }, 500);
    return () => clearTimeout(timer);
  }, [contests]);

  // Операции
  const addContest = (data) => {
    const newContest = { id: Date.now(), ...data };
    setContests([...contests, newContest]);
  };

  const updateContest = (id, data) => {
    setContests(contests.map(c =>
      c.id === id ? { ...c, ...data } : c
    ));
  };

  const deleteContest = (id) => {
    setContests(contests.filter(c => c.id !== id));
  };

  const changeStatus = (id, status) => {
    setContests(contests.map(c => c.id === id ? { ...c, status } : c));
  };

  // Фильтрация
  const filtered = filter === 'all'
    ? contests
    : contests.filter(c => c.status === filter);

  if (loading) return <p className={styles.loading}>Загрузка…</p>;

    return (
    <div className={styles.wrapper}>
        <ContestForm onAdd={addContest} />

        <div className={styles.controls}>
        <select
            className={styles.filter}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
        >
            <option value="all">Все</option>
            <option value="draft">Черновики</option>
            <option value="active">Активные</option>
            <option value="finished">Завершённые</option>
        </select>
        <p className={styles.stats}>
            Всего: {contests.length} | Показано: {filtered.length}
        </p>
        </div>

        {filtered.length === 0 ? (
        <p className={styles.empty}>Конкурсов пока нет</p>
        ) : (
        <ul className={styles.list}>
            {filtered.map(contest => (
            <ContestItem
                key={contest.id}
                contest={contest}
                onDelete={deleteContest}
                onStatusChange={changeStatus}
                onUpdate={updateContest}
            />
            ))}
        </ul>
        )}
    </div>
    );
}