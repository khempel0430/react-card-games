import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Toolbar } from 'primereact/toolbar';
import { Button } from 'primereact/button';
import '../App.css';
import './Landing.css';
import GameList from '../game-list/game-list.tsx';
import CardDeck from '../card-deck/card-deck.tsx';
import Solitaire from '../solitaire/solitaire.tsx';

const LandingContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const start = <span className="text-2xl font-bold">KHempel's React Cardgames</span>;
  
  const end = location.pathname !== '/' ? (
    <Button icon="pi pi-arrow-left" label="Back to Games List" onClick={() => navigate('/')} />
  ) : null;

  return (
    <>
      <Toolbar className="App-header" start={start} end={end} />
      <div className="App-content">
        <Routes>
          <Route path="/" element={<GameList />} />
          <Route path="/solitaire" element={<Solitaire />} />
          <Route path="/deck" element={<CardDeck />} />
        </Routes>
      </div>
    </>
  );
};

const Landing: React.FC = () => {
  return (
    <div className="App">
      <Router>
        <LandingContent />
      </Router>
    </div>
  );
};

export default Landing;
