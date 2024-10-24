export class Deck {
    id: string;
    type: string;
    name: string;
    description: string;
    DeckCards: string[]; 
  

    constructor(id: string, type: string, name: string, description: string,   DeckCards: string[]) {
      this.id = id;
      this.type = type;
      this.name = name;
      this.description = description;
      this.DeckCards = DeckCards
    }

}