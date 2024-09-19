export class Card {
    id: string;
    type: string;
    name: string;
    movement: number;
    damage: number;
    hp: number;
    cost: number;
    position: { x: number, y: number };
    description: string;
    imagePath: string;
    // owner: Player;
  
    constructor(id: string, type: string, name: string, movement: number, damage: number, hp: number, cost: number, position: { x: number, y: number }, description: string, imagePath: string) {
      this.id = id;
      this.type = type;
      this.name = name;
      this.movement = movement;
      this.damage = damage;
      this.hp = hp;
      this.cost = cost;
      this.position = position;
      this.description = description;
      this.imagePath = imagePath;
      // this.owner = owner;
    }
  
    move(newPosition: { x: number, y: number }) {
      this.position = newPosition;
    }
  
  
    untap() {

    }

    tap() {
        
    }

  }
  