import cardDeckService, { card, CardSuite } from '../card-deck/cardDeckService.ts';
import { IRulesDialogProps } from '../rules-dialog/rules-dialog.tsx';

export interface GameState {
  foundations: {
    [key in CardSuite]: card[];
  };
  tableau: card[][];
  stock: card[];
}

class KlondikeGameService {
  private static instance: KlondikeGameService;

  private constructor() {}

  public static getInstance(): KlondikeGameService {
    if (!KlondikeGameService.instance) {
      KlondikeGameService.instance = new KlondikeGameService();
    }
    return KlondikeGameService.instance;
  }

  private shuffle(): card[] {
    const deck = cardDeckService.getDeck();
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  public initializeGame(): GameState {
    const shuffledDeck = this.shuffle();
    const tableau: card[][] = [];
    let deckIndex = 0;

    for (let i = 0; i < 7; i++) {
      tableau.push([]);
      for (let j = 0; j <= i; j++) {
        const card = shuffledDeck[deckIndex];
        card.isFaceUp = j === i;
        tableau[i].push(card);
        deckIndex++;
      }
    }

    return {
      foundations: {
        hearts: [],
        diamonds: [],
        clubs: [],
        spades: [],
      },
      tableau,
      stock: shuffledDeck.slice(deckIndex),
    };
  }

  public getKlondikeRules(): IRulesDialogProps {
    return {
      decks: 1,
      initialLayout: 'There should be seven columns laid out in the tableau with the first column containing one card and each subsequent column containing one more card than the previous column. The top card of each column is face-up; the remainder of the cards are face-down. The 24 unplayed cards are left face-down to form the stock.  There should be space for four foundation piles.',
      objective: 'Move all cards to the foundation, building up each suit in separate piles from Ace to King.',
      play: 'You can move the top card of any column to any other column if it is one rank lower and of the opposite color. For example, a red five can be placed on a black six.  You can also move cards to the foundation piles in ascending order by suit.  The stock cards can be turned over one at a time to form a waste pile. The top card of the waste pile can be played to either the tableau or the foundation piles.  Empty tableau columns can only be filled with a King or a sequence of cards starting with a King.  Optional Rules: You may choose to turn over three cards at a time from the stock instead of one, making the game more challenging.',
      rulesLink: 'http://www.solitairecentral.com/rules/Klondike.html',
      rulesLinkName: 'Solitaire Central - Klondike Solitaire Rules'
    };
  }
}

export default KlondikeGameService.getInstance();
