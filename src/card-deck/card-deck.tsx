import React, { useState, useEffect } from 'react';
import './card-deck.css';

interface CardImage {
  name: string;
  src: string;
}

const CardDeck: React.FC = () => {
  const [cards, setCards] = useState<CardImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        console.log('Attempting to fetch CSV...');
        const response = await fetch('/assets/playing-cards-pack/PNG/Cards (large)/_cards.csv');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('CSV text length:', text.length);
        const fileNames = text.trim().split('\n').filter(name => name.trim());
        console.log('Loaded card names count:', fileNames.length);
        console.log('First 5 cards:', fileNames.slice(0, 5));

        const loadedCards: CardImage[] = fileNames.map((name) => ({
          name: name.trim(),
          src: `/assets/playing-cards-pack/PNG/Cards (large)/${name.trim()}.png`,
        }));

        console.log('Setting cards:', loadedCards.length);
        setCards(loadedCards);
      } catch (error) {
        console.error('Error loading cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  if (loading) {
    return <div className="card-deck"><p>Loading cards...</p></div>;
  }

  return (
    <div className="card-deck">
      <h2>Card Deck</h2>
      <div className="card-gallery">
        {cards.map((card) => (
          <div key={card.name} className="card-item">
            <img src={card.src} alt={card.name} />
            <p>{card.name}</p>
          </div>
        ))}
      </div>
      <div className="card-attribution">
        <p>Card images by <a href="https://kenney.nl/" target="_blank" rel="noopener noreferrer">Kenney</a></p>
      </div>
    </div>
  );
};

export default CardDeck;