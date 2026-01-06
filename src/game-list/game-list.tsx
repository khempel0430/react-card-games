import React from 'react';
import { Link } from 'react-router-dom';

const GameList: React.FC = () => {
  return (
    <div className="game-list">
      <h2>Available Games</h2>
      <p>Games coming soon...</p>
      <nav>
        <p><Link to="/solitaire">Solitaire</Link></p>
        <p><Link to="/deck">View Card Deck</Link></p>
      </nav>
    </div>
  );
};

export default GameList;
