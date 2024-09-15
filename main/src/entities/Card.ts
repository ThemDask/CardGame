class Card {
    id: string;
    type: string;
    name: string;
    movement: number;
    damage: number;
    hp: number;
    position: { x: number, y: number };
    owner: Player;
  
    constructor(id: string, type: string, name: string, movement: number, damage: number, hp: number, position: { x: number, y: number }, owner: Player) {
      this.id = id;
      this.type = type;
      this.name = name;
      this.movement = movement;
      this.damage = damage;
      this.hp = hp;
      this.position = position;
      this.owner = owner;
    }
  
    move(newPosition: { x: number, y: number }) {
      this.position = newPosition;
    }
  
    attack(targetCard: Card) {
        
    }
  
    untap() {

    }

    tap() {
        
    }
  }
  