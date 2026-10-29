import { useState } from 'react';
import { login, register } from '../api/auth';

export default function AuthForm({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
        await login(email, password);
      }
      onAuth();   
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка авторизации');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{isLogin ? 'Вход' : 'Регистрация'}</h3>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">{isLogin ? 'Войти' : 'Зарегистрироваться'}</button>
      <button type="button" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
      </button>
    </form>
  );
}