import { useState, useEffect } from 'react';

export default function useLocalStorage(key, initialValue) {

  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch (err) {
      console.error('Ошибка чтения localStorage:', err);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error('Ошибка записи в localStorage:', err);
    }
  }, [key, value]);

  return [value, setValue];
}