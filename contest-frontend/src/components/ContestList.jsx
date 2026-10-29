import { useState, useEffect } from 'react';
import {
  fetchContests,
  createContest,
  updateContest as apiUpdateContest,
  deleteContest as apiDeleteContest
} from '../api/contests';
import { getProfile } from '../api/auth';
import ContestForm from './ContestForm';
import ContestItem from './ContestItem';
import styles from './ContestList.module.css';

export default function ContestList() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce поиска — 1500 мс
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 1500);
    return () => clearTimeout(timer);
  }, [search]);

  // Загрузка конкурсов с гарантированной задержкой 1.5 сек
  const loadContests = async () => {
    setLoading(true);
    setError(null);
    try {
      const [response] = await Promise.all([
        fetchContests({ search: debouncedSearch }),
        new Promise(resolve => setTimeout(resolve, 1500))
      ]);
      setContests(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Не удалось загрузить конкурсы');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка профиля — один раз при монтировании
  const loadProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const data = await getProfile();
      setUser(data);
    } catch {
      setUser(null);
    }
  };

  // Профиль загружаем один раз
  useEffect(() => {
    loadProfile();
  }, []);

  // Конкурсы — при изменении поиска (и при монтировании)
  useEffect(() => {
    loadContests();
  }, [debouncedSearch]);

  const isAdmin = user?.role === 'admin';

  const addContest = async (data) => {
    const tempId = `temp-${Date.now()}`;
    const optimistic = { id: tempId, ...data, status: data.status || 'draft' };
    setContests(prev => [...prev, optimistic]);

    try {
      const { data: created } = await createContest(data);
      setContests(prev => prev.map(c => c.id === tempId ? created : c));
    } catch (err) {
      setContests(prev => prev.filter(c => c.id !== tempId));
      alert(err.response?.data?.error || 'Не удалось создать конкурс');
    }
  };

  const deleteContest = async (id) => {
    const removed = contests.find(c => c.id === id);
    setContests(prev => prev.filter(c => c.id !== id));

    try {
      await apiDeleteContest(id);
    } catch (err) {
      setContests(prev => [...prev, removed].sort((a, b) => a.id - b.id));
      alert(err.response?.data?.error || 'Не удалось удалить конкурс');
    }
  };

  const updateContest = async (id, data) => {
    const old = contests.find(c => c.id === id);
    setContests(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));

    try {
      const { data: updated } = await apiUpdateContest(id, data);
      setContests(prev => prev.map(c => c.id === id ? updated : c));
    } catch (err) {
      setContests(prev => prev.map(c => c.id === id ? old : c));
      alert(err.response?.data?.error || 'Не удалось обновить конкурс');
    }
  };

  const changeStatus = (id, status) => {
    const contest = contests.find(c => c.id === id);
    if (!contest) return;
    updateContest(id, {
      title: contest.title,
      description: contest.description,
      status
    });
  };

  if (loading) {
    return <p className={styles.loading}>Загрузка…</p>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button className={styles.retry} onClick={loadContests}>
          Повторить
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {isAdmin && <ContestForm onAdd={addContest} />}

      <div className={styles.controls}>
        <input
          className={styles.search}
          type="text"
          placeholder="Поиск конкурсов…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <p className={styles.stats}>Всего: {contests.length}</p>
      </div>

      {contests.length === 0 ? (
        <p className={styles.empty}>Конкурсов пока нет</p>
      ) : (
        <ul className={styles.list}>
          {contests.map(contest => (
            <ContestItem
              key={contest.id}
              contest={contest}
              canEdit={isAdmin}
              onDelete={deleteContest}
              onUpdate={updateContest}
              onStatusChange={changeStatus}
            />
          ))}
        </ul>
      )}
    </div>
  );
}