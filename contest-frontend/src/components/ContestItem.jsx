import { useState } from 'react';
import styles from './ContestItem.module.css';

export default function ContestItem({ contest, onDelete, onStatusChange, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(contest.title);
  const [description, setDescription] = useState(contest.description);

  const handleSave = () => {
    if (!title.trim() || !description.trim()) {
      alert('Заполните название и описание');
      return;
    }
    onUpdate(contest.id, {
      title: title.trim(),
      description: description.trim()
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Сбросить локальные состояния к исходным
    setTitle(contest.title);
    setDescription(contest.description);
    setIsEditing(false);
  };

  // Режим редактирования — показываем поля ввода
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
          <button className={styles.save} onClick={handleSave}>Сохранить</button>
          <button className={styles.cancel} onClick={handleCancel}>Отмена</button>
        </div>
      </li>
    );
  }

  // Обычный режим — карточка конкурса
  return (
    <li className={styles.item}>
      <h3 className={styles.title}>{contest.title}</h3>
      <p className={styles.description}>{contest.description}</p>
      <div className={styles.actions}>
        <select
          className={styles.status}
          value={contest.status}
          onChange={(e) => onStatusChange(contest.id, e.target.value)}
        >
          <option value="draft">Черновик</option>
          <option value="active">Активный</option>
          <option value="finished">Завершён</option>
        </select>
        <button className={styles.edit} onClick={() => setIsEditing(true)}>
          Редактировать
        </button>
        <button className={styles.delete} onClick={() => onDelete(contest.id)}>
          Удалить
        </button>
      </div>
    </li>
  );
}