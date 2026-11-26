import { useState, useEffect } from 'react';
import styles from './ContestItem.module.css';
import { socket } from '../api/socket';
import api from '../api/client';

export default function ContestItem({
  contest,
  canEdit,
  onDelete,
  onUpdate,
  onStatusChange
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(contest.title);
  const [description, setDescription] = useState(contest.description);
  const [entries, setEntries] = useState(contest.entries || []);

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const roomId = contest._id || contest.id; 
    socket.emit('join_contest', roomId);

    const handleVoteUpdated = (data) => {
      setEntries((prevEntries) =>
        prevEntries.map((entry) =>
          entry._id === data.entryId ? { ...entry, votes: data.votes } : entry
        )
      );
    };
    socket.on('vote_updated', handleVoteUpdated);

    const handleUserJoined = (data) => {
      setNotification(data.message);
      setTimeout(() => setNotification(null), 3000); 
    };
    const handleUserLeft = (data) => {
      setNotification(data.message);
      setTimeout(() => setNotification(null), 3000);
    };

    socket.on('user_joined', handleUserJoined);
    socket.on('user_left', handleUserLeft);

    return () => {
      socket.emit('leave_contest', roomId);
      socket.off('vote_updated', handleVoteUpdated);
      socket.off('user_joined', handleUserJoined);
      socket.off('user_left', handleUserLeft);
    };
  }, [contest._id, contest.id]);

  const handleSave = () => {
    if (!title.trim() || !description.trim()) {
      alert('Заполните название и описание');
      return;
    }
    onUpdate(contest._id || contest.id, {
      title: title.trim(),
      description: description.trim()
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTitle(contest.title);
    setDescription(contest.description);
    setIsEditing(false);
  };

  const handleVote = async (entryId) => {
    try {
      await api.post(`/contests/${contest._id || contest.id}/entries/${entryId}/vote`);
    } catch (err) {
      alert('Не удалось проголосовать');
    }
  };

  if (isEditing) {
    return (
      <li className={styles.item}>
        <input
          className={styles.editInput}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Название"
        />
        <input
          className={styles.editInput}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Описание"
        />
        <div className={styles.actions}>
          <button className={styles.save} onClick={handleSave}>
            Сохранить
          </button>
          <button className={styles.cancel} onClick={handleCancel}>
            Отмена
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className={styles.item}>
      {notification && (
        <div style={{
          background: '#e0f2fe',
          color: '#0284c7',
          padding: '8px',
          borderRadius: '5px',
          marginBottom: '10px',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          🔔 {notification}
        </div>
      )}

      <h3 className={styles.title}>{contest.title}</h3>
      <p className={styles.description}>{contest.description}</p>
      <p className={styles.status}>Статус: {contest.status}</p>

      {entries.length > 0 && (
        <div style={{ marginTop: '15px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
          <h4>Работы участников:</h4>
          <ul style={{ paddingLeft: '20px' }}>
            {entries.map((entry) => (
              <li key={entry._id} style={{ marginBottom: '10px' }}>
                <strong>{entry.author}</strong> — Голосов: <span style={{ color: 'blue', fontWeight: 'bold' }}>{entry.votes || 0}</span>
                <button 
                  onClick={() => handleVote(entry._id)} 
                  style={{ marginLeft: '10px', cursor: 'pointer' }}
                >
                  Голосовать
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {canEdit && (
        <div className={styles.actions} style={{ marginTop: '15px' }}>
          <select
            className={styles.statusSelect}
            value={contest.status}
            onChange={(e) => onStatusChange(contest._id || contest.id, e.target.value)}
          >
            <option value="draft">Черновик</option>
            <option value="active">Активный</option>
            <option value="finished">Завершён</option>
          </select>
          <button className={styles.edit} onClick={() => setIsEditing(true)}>
            Редактировать
          </button>
          <button className={styles.delete} onClick={() => onDelete(contest._id || contest.id)}>
            Удалить
          </button>
        </div>
      )}
    </li>
  );
}