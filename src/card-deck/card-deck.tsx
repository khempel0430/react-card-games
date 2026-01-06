import React, { useState, useEffect } from 'react';
import './card-deck.css';
import cardDeckService, { card, CardImage, specialCard } from './cardDeckService.ts';

const CardDeck: React.FC = () => {
  const [cards, setCards] = useState<(card | specialCard)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDeck = async () => {
      try {
        await cardDeckService.loadCards();
        const specialCards = cardDeckService.getSpecialCards();
        const regularCards = cardDeckService.getDeck();
        setCards([...specialCards, ...regularCards]);
      } catch (error) {
        console.error('Error loading deck:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDeck();
  }, []);

  if (loading) {
    return <div className="card-deck"><p>Loading cards...</p></div>;
  }

  return (
    <div className="card-deck">
      <h2>Card Deck</h2>
      <div className="card-gallery">
        {cards.map((cardOrSpecial) => {
          let cardImage: CardImage | null = null;
          let key: string;
          let altText: string;
          
          const isSpecial = 'suite' in cardOrSpecial === false && 'value' in cardOrSpecial === false;
          
          if (isSpecial) {
            const special = cardOrSpecial as specialCard;
            key = special.name;
            altText = special.name;
            if (special.name === 'Card back') {
              cardImage = cardDeckService.getBackCardImage();
            } else if (special.name === 'Empty card') {
              cardImage = cardDeckService.getEmptyCardImage();
            }
          } else {
            const regular = cardOrSpecial as card;
            key = `${regular.suite}-${regular.value}`;
            altText = regular.name;
            cardImage = cardDeckService.getCardBySuiteAndValue(regular.suite, regular.value);
          }
          
          return (
            <div key={key} className="card-item">
              {cardImage && <img src={cardImage.src} alt={altText} />}
              <p>{isSpecial ? (cardOrSpecial as specialCard).name : (cardOrSpecial as card).name}</p>
            </div>
          );
        })}
      </div>
      <div className="card-attribution">
        <p>Card images by <a href="https://kenney.nl/" target="_blank" rel="noopener noreferrer">Kenney</a></p>
      </div>
    </div>
  );
};

export default CardDeck;