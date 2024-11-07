import Phaser from 'phaser';
import { Card } from '../entities/Card';
import cardData from '../../../public/cardData.json';

export class DeckDisplayModal {
    private scene: Phaser.Scene;
    public container: Phaser.GameObjects.Container;
    public overlay: Phaser.GameObjects.Rectangle;
    private scrollMask: Phaser.GameObjects.Graphics;
    private deckContainer: Phaser.GameObjects.Container;
    private slots: Phaser.GameObjects.Rectangle[] = [];
    private cards: Card[] = [];

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        this.scene = scene;

        // Overlay setup
        this.overlay = this.scene.add.rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, 0x000000, 0.5)
            .setOrigin(0).setInteractive().setVisible(false).on('pointerdown', () => this.close());

        // Container setup
        this.container = this.scene.add.container(x, y).setVisible(false);
        const background = this.scene.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0).setStrokeStyle(2, 0xffffff); // TODO add different colors according to the deck 
        this.container.add(background);

        // Deck container for cards and slots
        this.deckContainer = this.scene.add.container(10, 10);
        this.container.add(this.deckContainer);

        // Create initial slots
        this.createSlots();
        this.createScrollMask(width, height);

        // Scroll input
        this.scene.input.on('wheel', (pointer: Phaser.Input.Pointer, _currentlyOver: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
            if (this.container.visible) {
                this.handleScroll(dy);
            }
        }, this);
    }

    private createSlots() {
        const slotWidth = 100;
        const slotHeight = 120;
        const marginX = 10;
        const marginY = 20;
        const slotsPerRow = 5;
        const totalSlots = 100;

        for (let i = 0; i < totalSlots; i++) {
            const row = Math.floor(i / slotsPerRow);
            const col = i % slotsPerRow;
            const slotX = col * (slotWidth + marginX);
            const slotY = row * (slotHeight + marginY);

            const slotBackground = this.scene.add.rectangle(slotX, slotY, slotWidth, slotHeight)
                .setStrokeStyle(2, 0xffffff)
                .setOrigin(0);

            this.deckContainer.add(slotBackground);
            this.slots.push(slotBackground);
        }
    }

    private createScrollMask(width: number, height: number) {
        this.scrollMask = this.scene.add.graphics();
        this.scrollMask.fillRect(10, 10, width - 20, height - 20);
        this.deckContainer.setMask(new Phaser.Display.Masks.GeometryMask(this.scene, this.scrollMask));
    }

    public displayDeck(deckIds: Card[], type: string) {
        // Clear any existing card images, but keep slots visible
        // TODO fix
        this.cards = [];
        let cardIndex = 0;
        if (type == "playerDeck") {
            deckIds.forEach(id => {
                const originalCard = cardData.find((card: any) => card.id === id);
                if (originalCard && cardIndex < this.slots.length) {
                    const card = new Card(
                        originalCard.id,
                        originalCard.type,
                        originalCard.name,
                        originalCard.movement ?? 0,
                        originalCard.damage ?? 0,
                        originalCard.ranged_damage ?? 0,
                        originalCard.range ?? 0,
                        originalCard.hp ?? 0,
                        originalCard.cost ?? 0,
                        originalCard.description ?? "",
                        originalCard.imagePath,
                        originalCard.keywords || []
                    );
    
                    const slot = this.slots[cardIndex];
                    const cardImage = this.scene.add.image(slot.x + 50, slot.y + 60, originalCard.imagePath)
                        .setDisplaySize(80, 100); // Adjust as needed
    
                    this.deckContainer.add(cardImage);
                    this.cards.push(card);
                    cardIndex++;
                } else if (!originalCard) {
                    console.warn(`Card with ID ${id} not found in card data.`);
                }
            });
        }
        else if (type === "schemeDeck") {
            // Directly use the `Card` objects passed in `deckIds`
            deckIds.forEach(card => {
                if (cardIndex < this.slots.length) {
                    const slot = this.slots[cardIndex];
                    const cardImage = this.scene.add.image(slot.x + 50, slot.y + 60, card.imagePath)
                        .setDisplaySize(80, 100); // Adjust as needed
    
                    this.deckContainer.add(cardImage);
                    this.cards.push(card);
                    cardIndex++;
                }
            });
        }

    }

    public open() {
        this.overlay.setVisible(true);
        this.container.setVisible(true);
    }

    public close() {
        this.overlay.setVisible(false);
        this.container.setVisible(false);
    }

    public toggle() {
        if (this.container.visible) {
            this.close();
        } else {
            this.open();
        }
    }

    private handleScroll(dy: number) {
        const scrollAmount = 10; // Adjust as needed
    
        // Update the Y position of the deckContainer
        this.deckContainer.y -= dy * scrollAmount;
    
        // Define the scrollable bounds manually
        const maskHeight = this.deckContainer.height > this.container.height ? this.container.height - 20 : this.deckContainer.height; // Adjust based on margin/padding
    
        const minY = 10; // Top limit (adjust if necessary)
        const maxY = this.container.height - maskHeight; // Bottom limit (container height minus maskHeight)
    
        // Clamp to prevent scrolling out of bounds
        if (this.deckContainer.y > minY) {
            this.deckContainer.y = minY;
        } else if (this.deckContainer.y < maxY) {
            this.deckContainer.y = maxY;
        }
    }
    
    
}
