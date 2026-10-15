import { useState } from 'react';
import styles from './ContestForm.module.css';

export default function ContestForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Заполните название и описание');
      return;
    }
    onAdd({ title: title.trim(), description: description.trim(), status: 'draft' });
    setTitle('');
    setDescription('');
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        type="text"
        placeholder="Название конкурса"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className={styles.input}
        type="text"
        placeholder="Описание"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button className={styles.button} type="submit">Добавить конкурс</button>
    </form>
  );
}