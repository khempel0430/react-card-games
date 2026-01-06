import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GameList from '../game-list/game-list.tsx';
import CardDeck from '../card-deck/card-deck.tsx';

const LandingRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GameList />} />
        <Route path="/deck" element={<CardDeck />} />
      </Routes>
    </Router>
  );
};

export default LandingRouter;
