import { Card } from "./Card";

export class Player {
    name: string;
    deck: Card[];
    time: number;
    seconds: number;
    availableGold: number;
  
    constructor(name: string, deck: Card[], time: number = 300, seconds: number = 300, availableGold: number = 100) { // TODO remove time OR seconds
      this.name = name;
      this.deck = deck;
      this.time = time; // 300 seconds timer
      this.seconds = seconds;
      this.availableGold = availableGold;
    }
  
    // drawCard() {

    // }
  
    // playCard(card: Card, position: { x: number, y: number }) {

    // }
  
    // pass() {

    // }
    countSeconds(count: boolean) {
      if (count) {
        this.seconds -= 1;
      }
      console.log(this.seconds)
  }
  
 
  }
  