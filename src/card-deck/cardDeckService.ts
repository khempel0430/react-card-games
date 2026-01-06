export interface CardImage {
  name: string;
  src: string;
}

export interface card {
    suite: CardSuite;
    value: CardValue;
    name: string;
}

export interface specialCard {
    name: string;
}

export enum CardSuite {
  HEARTS = 'hearts',
  DIAMONDS = 'diamonds',
  CLUBS = 'clubs',
  SPADES = 'spades'
}
export enum CardValue {
    ACE = 'A',
    TWO = '2',
    THREE = '3',
    FOUR = '4',
    FIVE = '5',
    SIX = '6',
    SEVEN = '7',
    EIGHT = '8',
    NINE = '9',
    TEN = '10',
    JACK = 'J',
    QUEEN = 'Q',
    KING = 'K'
}

class CardDeckService {
  private static instance: CardDeckService;
  private cards: CardImage[] | null = null;
  private loading: boolean = false;
  private error: Error | null = null;

  private constructor() {}

  public static getInstance(): CardDeckService {
    if (!CardDeckService.instance) {
      CardDeckService.instance = new CardDeckService();
    }
    return CardDeckService.instance;
  }

  public async loadCards(): Promise<void> {
    // Return if already loaded
    if (this.cards) {
      return;
    }

    // If already loading, wait for it to complete
    if (this.loading) {
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (!this.loading) {
            clearInterval(checkInterval);
            if (this.error) {
              reject(this.error);
            } else {
              resolve();
            }
          }
        }, 100);
      });
    }

    // Load the cards
    this.loading = true;
    try {
      const response = await fetch('/assets/playing-cards-pack/PNG/Cards (large)/_cards.csv');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      const fileNames = text.trim().split('\n').filter(name => name.trim());

      this.cards = fileNames.map((name) => ({
        name: name.trim(),
        src: `/assets/playing-cards-pack/PNG/Cards (large)/${name.trim()}.png`,
      }));
    } catch (error) {
      this.error = error instanceof Error ? error : new Error('Unknown error');
      throw this.error;
    } finally {
      this.loading = false;
    }
  }

  public getCardsSync(): CardImage[] | null {
    return this.cards;
  }

  public isLoading(): boolean {
    return this.loading;
  }

  public getError(): Error | null {
    return this.error;
  }

  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  public getCardBySuiteAndValue(suite: CardSuite, value: CardValue): CardImage | null {
    if (!this.cards) {
      return null;
    }
    return this.cards.find(card => card.name.includes(suite) && card.name.includes(value)) || null;
  }

  public getEmptyCardImage(): CardImage | null {
    if (!this.cards) {
      return null;
    }
    return this.cards.find(card => card.name.includes('empty')) || null;
  }

  public getBackCardImage(): CardImage | null {
    if (!this.cards) {
      return null;
    }
    return this.cards.find(card => card.name.includes('back')) || null;
}

  public getDeck(): card[] {
    const suites: CardSuite[] = Object.values(CardSuite);
    const values: CardValue[] = Object.values(CardValue);
    const names: string[] = Object.keys(CardValue);
    const deck: card[] = [];

    for (const suite of suites) {
      for (const value of values) {
        const suiteName = this.capitalizeFirstLetter(suite);
        const valueName = this.capitalizeFirstLetter(names[values.indexOf(value)]);
        deck.push({ 
          suite, 
          value, 
          name: `${valueName} of ${suiteName}`,
        });
      }
    }
    return deck;
  }

  public getSpecialCards(): specialCard[] {
    return [
      { name: 'Card back' },
      { name: 'Empty card' }
    ];
  }
}

export default CardDeckService.getInstance();
