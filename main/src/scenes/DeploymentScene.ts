import { DeckDisplayModal } from "../utils/DeckDisplayModal";
import { Player } from "../entities/Player";
import { createBackButton } from "../utils/helpers/backButton";
import { GameStateManager } from "../state/GameStateManager";
import { Card } from "../entities/Card";
import { createPlayerContainer } from "../utils/helpers/playerContainer";

export class DeploymentScene extends Phaser.Scene {
    private player1Timer: Phaser.GameObjects.Text;
    private player2Timer: Phaser.GameObjects.Text;
    private player1GoldText: Phaser.GameObjects.Text;
    private player2GoldText: Phaser.GameObjects.Text;
    
    private deckContainer: Phaser.GameObjects.Container;
    private scrollMask: Phaser.GameObjects.Graphics;
    private slots: Phaser.GameObjects.Rectangle[] = [];
    private cards: Phaser.GameObjects.Image[] = [];

    constructor() {
        super({ key: 'DeploymentScene' });
    }

    create() {

        this.input.keyboard?.on('keydown-ESC', () => {
            this.scene.launch('EscapeMenu');
        });


        // TODO: doesnt work will replace with esc menu
        createBackButton(this);

        const player1 = GameStateManager.getInstance().getPlayer1();
        const player2 = GameStateManager.getInstance().getPlayer2();
        const playerDeck = player1 ? player1.getDeck() : [];

        const { container: player1Container, playerTimer: player1Timer } = createPlayerContainer(this, 1800, 60, player1);
        const { container: player2Container, playerTimer: player2Timer } = createPlayerContainer(this, 1800, 1000, player2);

        this.player1Timer = player1Timer;
        this.player2Timer = player2Timer;

        this.add.existing(player1Container);
        this.add.existing(player2Container);

        // Create deck display area
        this.createDeckDisplay();

        // Display player's deck inside the container
        this.displayDeck(playerDeck);

        // Handle scroll input for deck
        this.input.on('wheel', (pointer: Phaser.Input.Pointer, _currentlyOver: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
            if (this.isPointerInsideDeck(pointer)) {
                this.handleScroll(dy);
            }
        });
    }

    private createDeckDisplay() {
        // Position the deck container below the CardDetailsPanel
        this.deckContainer = this.add.container(5, 720); 
    
        // Draw the deck background
        const deckBackground = this.add.rectangle(0, 0, 500, 500)
            .setStrokeStyle(5, 0xffffff)
            .setOrigin(0);
        
    
        this.deckContainer.add(deckBackground);
        this.add.existing(this.deckContainer);
    
        // Create scroll mask for new size
        this.createScrollMask(deckBackground.width, deckBackground.height);
    }
    
    private createScrollMask(width: number, height: number) {
        this.scrollMask = this.add.graphics();
        this.scrollMask.fillStyle(0xffffff, 0);
        this.scrollMask.fillRect(5, 720, width, height);
        this.deckContainer.setMask(new Phaser.Display.Masks.GeometryMask(this, this.scrollMask));
    }
    
    private displayDeck(cards: Card[]) {
        const slotWidth = 90; // Slightly reduced for 500px width
        const slotHeight = 110;
        const marginX = 8;
        const marginY = 15;
        const slotsPerRow = 5;
    
        for (let i = 0; i < 50; i++) { // Reduced number of slots for smaller height
            const row = Math.floor(i / slotsPerRow);
            const col = i % slotsPerRow;
    
            const slotX = col * (slotWidth + marginX);
            const slotY = row * (slotHeight + marginY);
    
            // Slot background
            const slotBackground = this.add.rectangle(slotX, slotY, slotWidth, slotHeight)
                .setStrokeStyle(2, 0xffffff)
                .setOrigin(0);
            this.deckContainer.add(slotBackground);
            this.slots.push(slotBackground);
    
            // Add card image
            if (i < cards.length) {
                const card = cards[i];
                const cardImage = this.add.image(slotX + slotWidth / 2, slotY + slotHeight / 2, card.imagePath)
                    .setDisplaySize(slotWidth, slotHeight)
                    .setInteractive();
    
                this.deckContainer.add(cardImage);
                this.cards.push(cardImage);
    
                // Hover interaction
                cardImage.on('pointerover', () => {
                    slotBackground.setStrokeStyle(5, 0x00cc00);
                });
                cardImage.on('pointerout', () => {
                    slotBackground.setStrokeStyle(2, 0xffffff);
                });
            }
        }
    }
    
    private isPointerInsideDeck(pointer: Phaser.Input.Pointer): boolean {
        return pointer.x >= 5 && pointer.x <= 505 && pointer.y >= 720 && pointer.y <= 1220;
    }
    
    private handleScroll(dy: number) {
        const scrollAmount = 10;
        this.deckContainer.y -= dy * scrollAmount;
    
        // Limit scrolling within bounds
        const minY = 720;
        const maxY = 720 - (this.cards.length / 5) * 140; // Adjusted for smaller size
    
        if (this.deckContainer.y > minY) {
            this.deckContainer.y = minY;
        } else if (this.deckContainer.y < maxY) {
            this.deckContainer.y = maxY;
        }
    }

    update(): void {
        const player1 = GameStateManager.getInstance().getPlayer1();
        if (player1) {
            this.player1Timer.setText(player1.getPlayerRemainingTime().toString());
        }

        const player2 = GameStateManager.getInstance().getPlayer2();
        if (player2) {
            this.player2Timer.setText(player2.getPlayerRemainingTime().toString());
        }
    }
}
