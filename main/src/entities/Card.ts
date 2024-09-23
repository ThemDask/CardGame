export class Card {
    id: string;
    type: string;
    name: string;
    movement: number;
    damage: number;
    ranged_damage: number;
    range: number;
    hp: number;
    cost: number;
    description: string;
    imagePath: string;
    keywords: string[]; 
  

    constructor(id: string, type: string, name: string, movement: number, damage: number, ranged_damage: number, range: number, hp: number,
        cost: number,  description: string, imagePath: string,  keywords: string[]) {
      this.id = id;
      this.type = type;
      this.name = name;
      this.movement = movement;
      this.damage = damage;
      this.ranged_damage = ranged_damage
      this.range = range;
      this.hp = hp;
      this.cost = cost;
      this.description = description;
      this.imagePath = imagePath;
      this.keywords = keywords;
    }
  
  
  
    untap() {

    }

    tap() {
        
    }

  }
  