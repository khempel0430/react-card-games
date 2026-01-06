import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import cardDeckService, { card, CardValue } from '../card-deck/cardDeckService.ts';
import cruelGameService from './cruelGameService.ts';
import './cruel.css';
import '../card-deck/card-deck.css';
import RulesDialog, { IRulesDialogProps } from '../rules-dialog/rules-dialog.tsx';

const Cruel: React.FC = () => {
  const [heartPile, setHeartPile] = useState<card[]>([]);
  const [diamondPile, setDiamondPile] = useState<card[]>([]);
  const [clubPile, setClubPile] = useState<card[]>([]);
  const [spadePile, setSpadePile] = useState<card[]>([]);
  const [tableauPiles, setTableauPiles] = useState<card[][]>([]);
  const [selectedPile, setSelectedPile] = useState<string | null>(null);
  const [rules, setRules] = useState<IRulesDialogProps | null>(null);

  useEffect(() => {
    const initializeDeck = async () => {
      try {
        await cardDeckService.loadCards();
        
        // Initialize the game
        const newGameState = cruelGameService.initializeGame();
        setHeartPile(newGameState.foundations.hearts);
        setDiamondPile(newGameState.foundations.diamonds);
        setClubPile(newGameState.foundations.clubs);
        setSpadePile(newGameState.foundations.spades);
        setTableauPiles(newGameState.tableau);
      } catch (error) {
        console.error('Error loading deck:', error);
      }
    };

    initializeDeck();
    setRules(cruelGameService.getCruelRules());
  }, []);

  const handleNewGame = () => {
    const newGameState = cruelGameService.initializeGame();
    setHeartPile(newGameState.foundations.hearts);
    setDiamondPile(newGameState.foundations.diamonds);
    setClubPile(newGameState.foundations.clubs);
    setSpadePile(newGameState.foundations.spades);
    setTableauPiles(newGameState.tableau);
  };

  const handlePileClick = (pileType: string) => {
    if (!selectedPile) {
      // Only allow selecting tableau piles
      if (pileType.startsWith('tableau-')) {
        setSelectedPile(pileType);
      }
      return;
    }

    // if selected pile is sames as destination, deselect
    if (selectedPile === pileType) {
      setSelectedPile(null);
      return;
    }

    // Only allow moves from tableau piles (not from foundation piles)
    if (selectedPile.startsWith('tableau-')) {
      const sourcePileIdx = parseInt(selectedPile.split('-')[1]);
      if (tableauPiles[sourcePileIdx] && tableauPiles[sourcePileIdx].length > 0) {
        const sourceCard = tableauPiles[sourcePileIdx][tableauPiles[sourcePileIdx].length - 1];
        const destinationCard = (() => {
          if (pileType === 'heart') return heartPile[heartPile.length - 1];
          if (pileType === 'diamond') return diamondPile[diamondPile.length - 1];
          if (pileType === 'club') return clubPile[clubPile.length - 1];
          if (pileType === 'spade') return spadePile[spadePile.length - 1];
          if (pileType.startsWith('tableau-')) {
            const destPileIdx = parseInt(pileType.split('-')[1]);
            return tableauPiles[destPileIdx][tableauPiles[destPileIdx].length - 1];
          }
        })();

        // Only allow moving to pile if top card of new pile is the same suit
         if (sourceCard.suite !== destinationCard?.suite) {
            return;
         }

        // If moving to foundation, check if card is next in sequence
        if (['heart', 'diamond', 'club', 'spade'].includes(pileType)) {
          const destPile = pileType === 'heart' ? heartPile :
            pileType === 'diamond' ? diamondPile :
              pileType === 'club' ? clubPile : spadePile;
          
          const expectedValue = destPile.length === 0 ? 'ACE' : 
            (Object.values(CardValue)[Object.values(CardValue).indexOf(destPile[destPile.length - 1].value) + 1]);
          
          if (sourceCard.value !== expectedValue) {
            return;
          }
        }

        // If moving to tableau, check if the card is one less in sequence
        if (pileType.startsWith('tableau-')) {
          const destPileIdx = parseInt(pileType.split('-')[1]);
          const destPile = tableauPiles[destPileIdx];
          const destTopCard = destPile[destPile.length - 1];
          const expectedValue = destTopCard ?
            Object.values(CardValue)[Object.values(CardValue).indexOf(destTopCard.value) - 1] : null;
          
          if (expectedValue && sourceCard.value !== expectedValue) {
            return;
          }
        }

        // remove selected card from source pile and add to destination pile
        const removeCardFromTableau = tableauPiles.map((p, idx) => {
        if (idx === sourcePileIdx) {
            return p.slice(0, -1);
        }
        return p;
        });
        setTableauPiles(removeCardFromTableau);
        
        if (pileType === 'heart') {
          setHeartPile([...heartPile, sourceCard]);
        } else if (pileType === 'diamond') {
          setDiamondPile([...diamondPile, sourceCard]);
        } else if (pileType === 'club') {
          setClubPile([...clubPile, sourceCard]);
        } else if (pileType === 'spade') {
          setSpadePile([...spadePile, sourceCard]);
        } else if (pileType.startsWith('tableau-')) {
          const destPileIdx = parseInt(pileType.split('-')[1]);
          const newTableau = removeCardFromTableau.map((p, idx) => {
            if (idx === destPileIdx) {
              return [...p, sourceCard];
            }
            return p;
          });
          setTableauPiles(newTableau);
        }
      }
    }

    setSelectedPile(null);
  };

  /**
   * Redeal the tableau piles by gathering all cards and dealing them into new 4-card piles
   * without shuffling.
   */
  const handleRedeal = () => {
    const allTableauCards: card[] = [];
    tableauPiles.forEach(pile => {
      allTableauCards.push(...pile);
    });
    const newTableau: card[][] = [];
    for (let i = 0; i < 12; i++) {
      newTableau.push(allTableauCards.slice(i * 4, (i + 1) * 4));
    }
    setTableauPiles(newTableau);
  }

  const getImage = (card: card | undefined) => {
    if (!card) return null;

    const cardImage = cardDeckService.getCardBySuiteAndValue(card.suite, card.value);
    if (cardImage) {
      return <img src={cardImage.src} alt={card.name} />;
    }
    return null;
  }

  const getFoundationClasses = (pileType: string) => {
    return `foundation-pile ${selectedPile === pileType ? 'selected' : ''}`;
  }

  const getTableauClasses = (pileIdx: number) => {
    return `tableau-pile ${selectedPile === `tableau-${pileIdx}` ? 'selected' : ''}`;
  }

  return (
    <div className="cruel">
      <h2>Cruel</h2>
      <div className="game-controls">
        <Button label="New Game" onClick={handleNewGame} />
        <RulesDialog {...(rules as IRulesDialogProps)} />
        <Button label="Redeal" onClick={handleRedeal} />
      </div>

      <div className="game-display">
        <div>
          <h3>Foundations</h3>
          <div className="foundations">
            <div className={getFoundationClasses('heart')} onClick={() => handlePileClick('heart')}>
              <strong>Hearts: </strong>
              <span className="card-item">
                {getImage(heartPile[heartPile.length - 1])}
              </span>
              <span>{heartPile[heartPile.length - 1]?.name}</span>
            </div>

            <div className={getFoundationClasses('diamond')} onClick={() => handlePileClick('diamond')}>
              <strong>Diamonds: </strong>
              <span className="card-item">
                {getImage(diamondPile[diamondPile.length - 1])}
              </span>
              <span>{diamondPile[diamondPile.length - 1]?.name}</span>
            </div>

            <div className={getFoundationClasses('club')} onClick={() => handlePileClick('club')}>
              <strong>Clubs: </strong>
              <span className="card-item">
                {getImage(clubPile[clubPile.length - 1])}
              </span>
              <span>{clubPile[clubPile.length - 1]?.name}</span>
            </div>

            <div className={getFoundationClasses('spade')} onClick={() => handlePileClick('spade')}>
              <strong>Spades: </strong>
              <span className="card-item">
                {getImage(spadePile[spadePile.length - 1])}
              </span>
              <span>{spadePile[spadePile.length - 1]?.name}</span>
            </div>
          </div>
        </div>

        <div>
          <h3>Tableau Piles</h3>
          <div className="tableau">
            {tableauPiles.map((pile, pileIdx) => (
              <div key={pileIdx} className={getTableauClasses(pileIdx)} onClick={() => handlePileClick(`tableau-${pileIdx}`)}>
                <strong>Pile {pileIdx + 1}: </strong>
                <span className="card-item">
                  {getImage(pile[pile.length - 1])}
                </span>
                <span>{pile.length > 0 ? pile[pile.length - 1]?.name : ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cruel;
