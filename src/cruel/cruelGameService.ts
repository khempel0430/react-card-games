import cardDeckService, { card, CardSuite, CardValue } from '../card-deck/cardDeckService.ts';
import { IRulesDialogProps } from '../rules-dialog/rules-dialog.tsx';

export interface GameState {
  foundations: {
    [key in CardSuite]: card[];
  };
  tableau: card[][];
}

class CruelGameService {
  private static instance: CruelGameService;

  private constructor() {}

  public static getInstance(): CruelGameService {
    if (!CruelGameService.instance) {
      CruelGameService.instance = new CruelGameService();
    }
    return CruelGameService.instance;
  }

  private shuffle(array: card[]): card[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  public initializeGame(): GameState {
    const deck = cardDeckService.getDeck();
    
    // Separate aces from the rest
    const aces: { [key in CardSuite]: card } = {
      hearts: null as any,
      diamonds: null as any,
      clubs: null as any,
      spades: null as any,
    };
    
    const remaining: card[] = [];
    
    for (const card of deck) {
      if (card.value === CardValue.ACE) {
        aces[card.suite] = card;
      } else {
        remaining.push(card);
      }
    }
    
    // Shuffle remaining cards
    const shuffled = this.shuffle(remaining);
    
    // Deal into 12 tableau piles of 4 cards each
    const tableau: card[][] = [];
    for (let i = 0; i < 12; i++) {
      tableau.push(shuffled.slice(i * 4, (i + 1) * 4));
    }
    
    // Initialize foundations with aces
    const foundations: GameState['foundations'] = {
      hearts: [aces.hearts],
      diamonds: [aces.diamonds],
      clubs: [aces.clubs],
      spades: [aces.spades],
    };
    
    return {
      foundations,
      tableau,
    };
  }

  public getCruelRules(): IRulesDialogProps {
    return {
      decks: 1,
      initialLayout: 'Put all the Aces into Foundation piles. The rest of the cards form the 12 tableau piles which are four cards each.',
      objective: 'Move all cards to the Foundation piles, building up each suit from Ace to King.',
      play: 'You can move the top card of any tableau pile to another tableau pile if it is one rank lower and of the same suit. Empty tableau piles can be filled with any card. You can also move cards to the Foundation piles in ascending order by suit.',
      rulesLink: 'http://www.solitairecentral.com/rules/Cruel.html',
      rulesLinkName: 'Solitaire Central - Cruel Solitaire Rules'
    };
  }
}

export default CruelGameService.getInstance();
