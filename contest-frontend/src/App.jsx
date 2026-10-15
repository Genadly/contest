import './App.css';
import ContestList from './components/ContestList';

function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Управление конкурсами</h1>
        <p className="app__subtitle">
          Сервис для голосования и фотоконкурсов
        </p>
      </header>
      <ContestList />
    </div>
  );
}

export default App;