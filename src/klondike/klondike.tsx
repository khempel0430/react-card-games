import React, { use, useEffect, useState } from 'react';
import RulesDialog, { IRulesDialogProps } from '../rules-dialog/rules-dialog.tsx'
import { Button } from 'primereact/button';
import { ToggleButton } from 'primereact/togglebutton';
import KlondikeGameService from './klondikeGameService.ts';
import cardDeckService, { card, CardImage, CardSuite } from '../card-deck/cardDeckService.ts';
import './klondike.css';

type PileType = 'foundation' | 'tableau' | 'stock' | 'waste';

interface ISelectedPile {
  type: PileType;
  index?: number;
}

const Klondike: React.FC = () => {
  const [useThreeCards, setUseThreeCards] = React.useState<boolean>(false);
  const [rules, setRules] = useState<IRulesDialogProps | null>(null);
    const [foundationPiles, setFoundationPiles] = useState<{ [key in CardSuite]: card[]; }>({
      hearts: [],
      diamonds: [],
      clubs: [],
      spades: [],
    });
    const [tableauPiles, setTableauPiles] = useState<card[][]>([]);
    const [stockPile, setStockPile] = useState<card[]>([]);
    const [wastePile, setWastePile] = useState<card[]>([]);
    const [selectedPile, setSelectedPile] = useState<ISelectedPile | null>(null);
    const [cardBackImage, setCardBackImage] = useState<CardImage | null>(null);
    const [cardBlankImage, setCardBlankImage] = useState<CardImage | null>(null);
  
  useEffect(() => {
    const initializeDeck = async () => {
      try {
        await cardDeckService.loadCards();
        setCardBackImage(cardDeckService.getBackCardImage());
        setCardBlankImage(cardDeckService.getEmptyCardImage());
        
        // Initialize the game
        const newGameState = KlondikeGameService.initializeGame();
        setFoundationPiles(newGameState.foundations);
        setTableauPiles(newGameState.tableau);
        setStockPile(newGameState.stock);
      } catch (error) {
        console.error('Error loading deck:', error);
      }
    };

    initializeDeck();
    setRules(KlondikeGameService.getKlondikeRules());
  }, []);

  const blankCardImg = () => {
    return <img src={cardBlankImage?.src} alt={cardBlankImage?.name} />;
  }

  const toggleStockCards = () => {
    setUseThreeCards(!useThreeCards);
  }

  function handleNewGame(): void {
    const newGameState = KlondikeGameService.initializeGame();
    setFoundationPiles(newGameState.foundations);
    setTableauPiles(newGameState.tableau);
    setStockPile(newGameState.stock);
    setWastePile([]);
    setSelectedPile(null);
  }

  const getImage = (card: card | undefined, isFaceUp: boolean) => {
    if (!card) return blankCardImg();

    if (!isFaceUp) {
      return <img src={cardBackImage?.src} alt={cardBackImage?.name} />;
    }

    const cardImage = cardDeckService.getCardBySuiteAndValue(card.suite, card.value);
    if (cardImage) {
      return <img src={cardImage.src} alt={card.name} />;
    }
    return blankCardImg();
  }

  const getStockPileImage = () => {
    if (stockPile.length === 0) {
      return blankCardImg();
    } else {
      return <img src={cardBackImage?.src} alt={cardBackImage?.name} />;
    }
  }

  const getWastePileImage = () => {
    if (wastePile.length === 0) {
      return blankCardImg();
    } else {
      if (useThreeCards) {
        const lastThreeCards = wastePile.slice(-3);
        return lastThreeCards.map((card, index) => (
          <span key={index} style={{ left: `${index * 15}px`, position: 'absolute' }}>
            {getImage(card, true)}
          </span>
        ));
      }
      return getImage(wastePile[wastePile.length - 1], true);
    }
  }

  const handlePileClick = (pileType: PileType, pileIdx?: number): void => {
    // if there is no selected pile, and the foundation is clicked, do nothing
    if (pileType === 'foundation' && selectedPile === null) {
      return;
    }

    // if Stock pile is clicked add to waste pile
    // if Stock pile is empty, reset from waste pile
    // if there is a selected pile, set selected pile to null
    if (pileType === 'stock') {
      if (stockPile.length === 0) {
        setStockPile(wastePile.reverse());
        setWastePile([]);
      } else {
        const cardsToDraw = useThreeCards ? Math.min(3, stockPile.length) : 1;
        const drawnCards = stockPile.slice(-cardsToDraw);
        setWastePile([...wastePile, ...drawnCards]);
        setStockPile(stockPile.slice(0, -cardsToDraw));
      }
      setSelectedPile(null);
      return;
    }

    if (selectedPile === null) {
      setSelectedPile({
        type: pileType,
        index: pileIdx,
      });
      return;
    }

    setSelectedPile(null);
  }

  return (
    <div className="klondike">
      <h2>Klondike</h2>
      <div className="game-controls">
        <Button label="New Game" onClick={handleNewGame} />
        <RulesDialog {...(rules as IRulesDialogProps)} />
        <div>
          <label htmlFor="stockToggle" style={{ marginRight: '0.5em' }}>Stock Cards to Draw</label>
          <ToggleButton
            disabled
            id="stockToggle"
            checked={useThreeCards}
            onChange={toggleStockCards}
            onLabel="3 Cards"
            offLabel="1 Card"
          />
        </div>
      </div>
      <div className="klondike-game-area">
        <div className="klondike-upper-area">
          <div className="klondike-foundations">
            <span className="card-item" onClick={() => handlePileClick('foundation', 0)}>
              {getImage(foundationPiles.hearts[0], true)}
            </span>
            <span className="card-item" onClick={() => handlePileClick('foundation', 1)}>
              {getImage(foundationPiles.diamonds[0], true)}
            </span>
            <span className="card-item" onClick={() => handlePileClick('foundation', 2)}>
              {getImage(foundationPiles.clubs[0], true)}
            </span>
            <span className="card-item" onClick={() => handlePileClick('foundation', 3)}>
              {getImage(foundationPiles.spades[0], true)}
            </span>
          </div>
          <div className="klondike-stock">
            <div className="klondike-stock-pile" onClick={() => handlePileClick('stock')}>
              <span className="card-item">{getStockPileImage()}</span>
            </div>
            <div className="klondike-waste-pile" onClick={() => handlePileClick('waste')}>
              <span className="card-item">{getWastePileImage()}</span>
            </div>
          </div>
        </div>
        <div className="klondike-tableau">
          {tableauPiles.map((pile, pileIdx) => (
            <div key={pileIdx} className="klondike-tableau-pile" onClick={() => handlePileClick('tableau', pileIdx)}>
              {pile.map((card, cardIdx) => (
                <span key={cardIdx} className="card-item" style={{ top: `-${cardIdx * 120}px` }}>
                  {getImage(card, card.isFaceUp || false)}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Klondike;
