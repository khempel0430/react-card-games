import cardDeckService, { card, CardSuite, CardValue } from '../card-deck/cardDeckService.ts';

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
}

export default CruelGameService.getInstance();
