import Phaser from 'phaser';
import { Card } from '../entities/Card'; // Ensure the Card class is correctly exported in Card.ts
import { CardDetailsPanel } from '../utils/CardDetailsPanel'; // Assuming you have the CardDetailsPanel file ready

export class DeckBuilderScene extends Phaser.Scene {
    private gold: number;
    private myDeck: Card[];
    private globalPool: Card[];
    private selectedCard: Card | null = null;
    private cardDetailsPanel: CardDetailsPanel;

    constructor() {
        super({ key: 'DeckBuilderScene' });
        this.gold = 100; // Initial gold
        this.myDeck = []; // Cards in my deck
        this.globalPool = this.createGlobalPool(); // Available cards
    }

    preload() {
        this.load.image('card', '/assets/card-image.jpg'); // Sample image for all cards
    }

    create() {
        // Add CardDetailsPanel to the scene (on the left side, occupying 1/4 of the screen)
        this.cardDetailsPanel = new CardDetailsPanel(this, 0, 0, 300, this.cameras.main.height); // Adjust size as needed

        // Create rectangles for my deck and global pool
        this.createRectangles();
        this.createGoldCounter();

        // Display the current decks and card slots
        this.displayDeck(this.myDeck, 'My Deck', 320, 100); // Left (adjusted for panel)
        this.displayDeck(this.globalPool, 'Global Pool', 1220, 100); // Right
    }

    createRectangles() {
        // Left side rectangle for my deck
        this.add.rectangle(320, 100, 600, 800).setStrokeStyle(5, 0xffffff).setOrigin(0);
        // Right side rectangle for global pool
        this.add.rectangle(1220, 100, 600, 800).setStrokeStyle(5, 0xffffff).setOrigin(0);

        // Labels for each deck
        this.add.text(320, 50, 'My Deck', { font: '32px Arial', color: '#ffffff' });
        this.add.text(1220, 50, 'Global Pool', { font: '32px Arial', color: '#ffffff' });
    }

    createGoldCounter() {
        // Display gold count
        this.add.text(900, 50, `Gold: ${this.gold}`, { font: '32px Arial', color: '#ffffff' });
    }

    displayDeck(cards: Card[], label: string, x: number, y: number) {
        // Loop through 20 slots for the deck
        for (let i = 0; i < 20; i++) {
            const slotX = x + (i % 5) * 110;
            const slotY = y + Math.floor(i / 5) * 140;

            // Draw empty slot background (if no card)
            this.add.rectangle(slotX, slotY, 100, 120).setStrokeStyle(2, 0xffffff).setOrigin(0);

            if (i < cards.length) {
                const card = cards[i];
                const cardImage = this.add.image(slotX + 50, slotY + 60, 'card').setDisplaySize(100, 120);
                
                // Make card clickable
                cardImage.setInteractive();
                cardImage.on('pointerdown', () => {
                    this.handleCardClick(card, x === 320); // True if it's from 'My Deck'
                });

                // Display card gold value
                this.add.text(slotX + 10, slotY + 10, `${card.cost}`, { font: '18px Arial', color: '#fff' });

                // Display card details on hover
                cardImage.on('pointerover', () => {
                    this.updateCardDetailsPanel(card);
                });

                cardImage.on('pointerout', () => {
                    this.updateCardDetailsPanel(null); // Clear the panel if not hovering
                });
            }
        }
    }

    handleCardClick(card: Card, isMyDeck: boolean) {
        if (isMyDeck) {
            // Remove card from 'My Deck'
            const index = this.myDeck.indexOf(card);
            if (index > -1) {
                this.myDeck.splice(index, 1);
                this.globalPool.push(card); // Return card to the global pool
                this.gold += card.cost; // Refund gold
            }
        } else { 
            // Add card to 'My Deck' if there's enough gold and space
            if (this.gold >= card.cost && this.myDeck.length < 40) {
                this.gold -= card.cost;
                this.myDeck.push(card);
                const index = this.globalPool.indexOf(card);
                this.globalPool.splice(index, 1); // Remove card from global pool
            }
        }
        // Redraw the scene
        this.scene.restart();
    }

    createGlobalPool(): Card[] {
        // Updated global pool with the new `description` parameter
        return [
            new Card('1', 'monster', 'Goblin', 2, 3, 5, 5, { x: 0, y: 0 }, 'A sneaky goblin with average stats.'),
            new Card('2', 'monster', 'Orc', 3, 6, 8, 7, { x: 0, y: 0 }, 'A brutish orc with high damage.'),
            new Card('3', 'monster', 'Troll', 1, 7, 12, 9, { x: 0, y: 0 }, 'A slow-moving troll with high health.'),
            new Card('4', 'monster', 'Dragon', 4, 10, 15, 12, { x: 0, y: 0 }, 'A mighty dragon with devastating power.'),
            new Card('5', 'monster', 'Elf', 3, 4, 6, 4, { x: 0, y: 0 }, 'A nimble elf with balanced stats.'),
            new Card('6', 'monster', 'Knight', 2, 5, 9, 6, { x: 0, y: 0 }, 'A well-armored knight.'),
        ];
    }

    // Updates the CardDetailsPanel when hovering over a card
    updateCardDetailsPanel(card: Card | null) {
        if (card) {
            this.cardDetailsPanel.updatePanel(card.name, card.type, card.movement, card.damage, card.hp, card.description, card.cost);
        } else {
            this.cardDetailsPanel.updatePanel('', '', 0, 0, 0, '', 0); // Clear the panel when no card is selected
        }
    }
}
