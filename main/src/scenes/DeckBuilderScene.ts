import Phaser from 'phaser';
import { Card } from '../entities/Card'; 
import { CardDetailsPanel } from '../utils/CardDetailsPanel';
import { resizeAndCenterImage } from '../utils/helpers/resizeAndCenterImage';
import { createGlobalCardPool } from '../utils/helpers/createGlobalCardPool';

export class DeckBuilderScene extends Phaser.Scene {
    private gold: number;
    private myDeck: Card[];
    private globalPool: Card[];
    private myDeckContainer: Phaser.GameObjects.Container;
    private globalPoolContainer: Phaser.GameObjects.Container;
    private cardDetailsPanel: CardDetailsPanel;
    private myDeckMask: Phaser.GameObjects.Graphics;
    private globalPoolMask: Phaser.GameObjects.Graphics;

    constructor() {
        super({ key: 'DeckBuilderScene' });
        this.gold = 100; 
        this.myDeck = []; 
        this.globalPool = createGlobalCardPool(true); 
    }

    preload() {
        this.load.image('Goblin', '/assets/crossbow.png'); 
        this.load.image('archer', '/assets/archer.png'); 
        this.load.image('banner', '/assets/banner.png'); 
    }

    create() {

        this.cardDetailsPanel = new CardDetailsPanel(this, 0, 0, 300, this.cameras.main.height); 
        this.cardDetailsPanel.updatePanel(null);

        this.createRectangles();

        this.add.text(900, 50, `Gold: ${this.gold}`, { font: '32px Arial', color: '#ffffff' });


        this.myDeckContainer = this.add.container(320, 100);
        this.globalPoolContainer = this.add.container(1220, 100);

        // Add mask for scrolling areas
        this.createMasks();

        this.displayDeck(this.myDeck, 'My Deck', this.myDeckContainer, 320, 100); 
        this.displayDeck(this.globalPool, 'Global Pool', this.globalPoolContainer, 1220, 100);
        

        // Input for scrolling
        this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _currentlyOver: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
            this.handleScroll(dy);
        });
    }

    createRectangles() {
        // Left side rectangle for my deck
        this.add.rectangle(320, 100, 600, 800).setStrokeStyle(5, 0xffffff).setOrigin(0);
        // Right side rectangle for global pool
        this.add.rectangle(1220, 100, 600, 800).setStrokeStyle(5, 0xffffff).setOrigin(0);

        this.add.text(320, 50, 'My Deck', { font: '32px Arial', color: '#ffffff' });
        this.add.text(1220, 50, 'Global Pool', { font: '32px Arial', color: '#ffffff' });
    }

    displayDeck(cards: Card[], _label: string, container: Phaser.GameObjects.Container, x: number, y: number) {
        // Loop through all slots for the deck
        for (let i = 0; i < 100; i++) {
            const slotX = (i % 5) * 110; // Adjusted to be relative to the container
            const slotY = Math.floor(i / 5) * 140;
    
            // Draw empty slot background (if no card)
            const slotBackground = this.add.rectangle(slotX, slotY, 100, 120).setStrokeStyle(2, 0xffffff).setOrigin(0);
            container.add(slotBackground); // Add slot background to the container
    
            if (i < cards.length) {
                const card = cards[i];
                const cardImage = this.add.image(slotX + 50, slotY + 60, card.imagePath).setDisplaySize(100, 120);
    
                // Resize and center the card image within the slot
                const boundingBox = new Phaser.Geom.Rectangle(slotX, slotY, 100, 120);
                resizeAndCenterImage(cardImage, boundingBox);
    
                container.add(cardImage); // Add card image to the container
    
                cardImage.setInteractive();
                cardImage.on('pointerdown', () => {
                    this.handleCardClick(card, container === this.myDeckContainer); // Detect if it's 'My Deck'
                });
    
                // Display card gold value
                const goldText = this.add.text(slotX + 10, slotY + 10, `${card.cost}`, { font: '18px Arial', color: '#000' });
                container.add(goldText); // Add gold text to the container
    
                // Add interactivity for showing card details
                cardImage.on('pointerover', () => {
                    this.cardDetailsPanel.updatePanel(card);
                });
    
                cardImage.on('pointerout', () => {
                    this.cardDetailsPanel.updatePanel(null);
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

    createMasks() {
        // Create mask for "My Deck"
        this.myDeckMask = this.add.graphics();
        this.myDeckMask.fillRect(320, 100, 600, 800);
        this.myDeckContainer.setMask(new Phaser.Display.Masks.GeometryMask(this, this.myDeckMask));

        // Create mask for "Global Pool"
        this.globalPoolMask = this.add.graphics();
        this.globalPoolMask.fillRect(1220, 100, 600, 800);
        this.globalPoolContainer.setMask(new Phaser.Display.Masks.GeometryMask(this, this.globalPoolMask));
    }

    handleScroll(dy: number) {
        const scrollSpeed = 1; 
        this.myDeckContainer.y -= dy * scrollSpeed;
        this.globalPoolContainer.y -= dy * scrollSpeed;

        // Optional: Add boundary conditions for scrolling
        const myDeckMinY = 100;
        const globalPoolMinY = 100;
        if (this.myDeckContainer.y > myDeckMinY) this.myDeckContainer.y = myDeckMinY;
        if (this.globalPoolContainer.y > globalPoolMinY) this.globalPoolContainer.y = globalPoolMinY;
    }

}
