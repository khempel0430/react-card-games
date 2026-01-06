import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import cardDeckService, { card, CardSuite, CardValue } from '../card-deck/cardDeckService.ts';
import cruelGameService from './cruelGameService.ts';
import './cruel.css';
import '../card-deck/card-deck.css';
import RulesDialog, { IRulesDialogProps } from '../rules-dialog/rules-dialog.tsx';

const Cruel: React.FC = () => {
  const [foundationPiles, setFoundationPiles] = useState<{ [key in CardSuite]: card[]; }>({
    hearts: [],
    diamonds: [],
    clubs: [],
    spades: [],
  });
  const [tableauPiles, setTableauPiles] = useState<card[][]>([]);
  const [selectedPile, setSelectedPile] = useState<string | null>(null);
  const [rules, setRules] = useState<IRulesDialogProps | null>(null);
  const cardValues = Object.values(CardValue);
  const suites = Object.values(CardSuite);

  useEffect(() => {
    const initializeDeck = async () => {
      try {
        await cardDeckService.loadCards();
        
        // Initialize the game
        const newGameState = cruelGameService.initializeGame();
        setFoundationPiles(newGameState.foundations);
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
    setFoundationPiles(newGameState.foundations);
    setTableauPiles(newGameState.tableau);
  };

  const handlePileClick = (pileType: string) => {
    if (!selectedPile) {
      const selectedPileIdx = pileType.startsWith('tableau-') ? parseInt(pileType.split('-')[1]) : null;

      // Only allow selecting tableau piles if they have cards
      if (selectedPileIdx !== null) {
        if (tableauPiles[selectedPileIdx] && tableauPiles[selectedPileIdx].length > 0) {
          setSelectedPile(pileType);
        }
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
          switch (pileType) {
            case CardSuite.HEARTS: return getTopFoundationCard(CardSuite.HEARTS);
            case CardSuite.DIAMONDS: return getTopFoundationCard(CardSuite.DIAMONDS);
            case CardSuite.CLUBS: return getTopFoundationCard(CardSuite.CLUBS);
            case CardSuite.SPADES: return getTopFoundationCard(CardSuite.SPADES);
            default:
              if (pileType.startsWith('tableau-')) {
                const destPileIdx = parseInt(pileType.split('-')[1]);
                return tableauPiles[destPileIdx][tableauPiles[destPileIdx].length - 1];
              }
          }
        })();

        // Only allow moving to pile if top card of new pile is the same suit
         if (sourceCard.suite !== destinationCard?.suite) {
            return;
         }

        // If moving to foundation, check if card is next in sequence
        if (suites.includes(pileType as CardSuite)) {
          const destPile = pileType === CardSuite.HEARTS ? foundationPiles.hearts :
            pileType === CardSuite.DIAMONDS ? foundationPiles.diamonds :
              pileType === CardSuite.CLUBS ? foundationPiles.clubs : foundationPiles.spades;
          
          const expectedValue = destPile.length === 0 ? 'ACE' : 
            (cardValues[cardValues.indexOf(destPile[destPile.length - 1].value) + 1]);
          
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
            cardValues[cardValues.indexOf(destTopCard.value) - 1] : null;
          
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
        
        switch (pileType) {
          case CardSuite.HEARTS:
            setFoundationPiles({...foundationPiles, hearts: [...foundationPiles.hearts, sourceCard]});
            break;
          case CardSuite.DIAMONDS:
            setFoundationPiles({...foundationPiles, diamonds: [...foundationPiles.diamonds, sourceCard]});
            break;
          case CardSuite.CLUBS:
            setFoundationPiles({...foundationPiles, clubs: [...foundationPiles.clubs, sourceCard]});
            break;
          case CardSuite.SPADES:
            setFoundationPiles({...foundationPiles, spades: [...foundationPiles.spades, sourceCard]});
            break;
          default:
            const destPileIdx = parseInt(pileType.split('-')[1]);
            const newTableau = removeCardFromTableau.map((p, idx) => {
              if (idx === destPileIdx) {
                return [...p, sourceCard];
              }
              return p;
            });
            setTableauPiles(newTableau);
            break;
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

  const getFoundationClasses = (pileType: CardSuite) => {
    return `foundation-pile ${selectedPile === pileType ? 'selected' : ''}`;
  }

  const getTableauClasses = (pileIdx: number) => {
    return `tableau-pile ${selectedPile === `tableau-${pileIdx}` ? 'selected' : ''}`;
  }

  const getTopFoundationCard = (suite: CardSuite) => {
    const pile = foundationPiles[suite];
    return pile[pile.length - 1];
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
            <div className={getFoundationClasses(CardSuite.HEARTS)} onClick={() => handlePileClick(CardSuite.HEARTS)}>
              <strong>Hearts: </strong>
              <span className="card-item">
                {getImage(getTopFoundationCard(CardSuite.HEARTS))}
              </span>
              <span>{getTopFoundationCard(CardSuite.HEARTS)?.name}</span>
            </div>

            <div className={getFoundationClasses(CardSuite.DIAMONDS)} onClick={() => handlePileClick(CardSuite.DIAMONDS)}>
              <strong>Diamonds: </strong>
              <span className="card-item">
                {getImage(getTopFoundationCard(CardSuite.DIAMONDS))}
              </span>
              <span>{getTopFoundationCard(CardSuite.DIAMONDS)?.name}</span>
            </div>

            <div className={getFoundationClasses(CardSuite.CLUBS)} onClick={() => handlePileClick(CardSuite.CLUBS)}>
              <strong>Clubs: </strong>
              <span className="card-item">
                {getImage(getTopFoundationCard(CardSuite.CLUBS))}
              </span>
              <span>{getTopFoundationCard(CardSuite.CLUBS)?.name}</span>
            </div>

            <div className={getFoundationClasses(CardSuite.SPADES)} onClick={() => handlePileClick(CardSuite.SPADES)}>
              <strong>Spades: </strong>
              <span className="card-item">
                {getImage(getTopFoundationCard(CardSuite.SPADES))}
              </span>
              <span>{getTopFoundationCard(CardSuite.SPADES)?.name}</span>
            </div>
          </div>
        </div>

        <div>
          <h3>Tableau Piles</h3>
          <div className="tableau">
            {tableauPiles.map((pile, pileIdx) => (
              <div key={pileIdx} className={getTableauClasses(pileIdx)} onClick={() => handlePileClick(`tableau-${pileIdx}`)}>
                <strong>Pile {pileIdx + 1}: </strong>
                <span className="card-item">{getImage(pile[pile.length - 1])}</span>
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
