import { useState } from 'react';
import './App.css';
import ContestList from './components/ContestList';
import AuthForm from './components/AuthForm';
import { logout } from './api/auth';

function App() {
  const [authVersion, setAuthVersion] = useState(0);
  const token = localStorage.getItem('token');

  const handleAuth = () => {
    setAuthVersion(v => v + 1);
  };

  const handleLogout = () => {
    logout();
    setAuthVersion(v => v + 1);
  };

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-top">
          <div>
            <h1 className="app__title">Управление конкурсами</h1>
            <p className="app__subtitle">
              Сервис для голосования и фотоконкурсов
            </p>
          </div>
          {token && (
            <button className="app__logout" onClick={handleLogout}>
              Выйти
            </button>
          )}
        </div>
      </header>

      {!token ? (
        <AuthForm onAuth={handleAuth} />
      ) : (
        <ContestList key={authVersion} />
      )}
    </div>
  );
}

export default App;