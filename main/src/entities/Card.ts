export class Card {
    id: string;
    type: string;
    name: string;
    movement: number;
    damage: number;
    ranged_damage: number;
    range: number;
    hp: number;
    actions: number;
    description: string;
    imagePath: string;
    keywords: string[]; 
    isFaceUp: boolean = false; // Track if the card is face up or face down
    isTapped: boolean = false; // Track if the card is tapped or untapped
    currentHP: number; // Current HP (can be reduced by damage)
    visualSprite: Phaser.GameObjects.Image | null = null; // Reference to visual representation

    constructor(id: string, type: string, name: string, movement: number, damage: number, ranged_damage: number, range: number, hp: number,
        actions: number, description: string, imagePath: string, keywords: string[]) {
      this.id = id;
      this.type = type;
      this.name = name;
      this.movement = movement;
      this.damage = damage;
      this.ranged_damage = ranged_damage
      this.range = range;
      this.hp = hp;
      this.actions = actions;
      this.description = description;
      this.imagePath = imagePath;
      this.keywords = keywords;
      this.isFaceUp = false;
      this.isTapped = false;
      this.currentHP = hp; // Initialize current HP to max HP
    }
  
  
    untap() {

    }

    tap() {
        
    }

    findImage() {
      if (this.imagePath) {
        // check if imagePath leads to png else display placeholder
      }
    }

  }
  