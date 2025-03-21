import { DeckDisplayModal } from "../utils/DeckDisplayModal";
import { Player } from "../entities/Player";
import { createBackButton } from "../utils/helpers/backButton";
import { GameStateManager } from "../state/GameStateManager";
import { Card } from "../entities/Card";
import { createPlayerContainer } from "../utils/helpers/playerContainer";
import { CardDetailsPanel } from "../utils/CardDetailsPanel";
import cardData from '../../../public/cardData.json';

export class DeploymentScene extends Phaser.Scene {
    private player1Timer: Phaser.GameObjects.Text;
    private player2Timer: Phaser.GameObjects.Text;
    private player1GoldText: Phaser.GameObjects.Text;
    private player2GoldText: Phaser.GameObjects.Text;
    private cardDetailsPanel: CardDetailsPanel;
    private deckContainer: Phaser.GameObjects.Container;
    private scrollMask: Phaser.GameObjects.Graphics;
    private slots: Phaser.GameObjects.Rectangle[] = [];
    private cards: Phaser.GameObjects.Image[] = [];
    deckDisplay: DeckDisplayModal;

    constructor() {
        super({ key: 'DeploymentScene' });
    }

    create() {

        this.cardDetailsPanel = new CardDetailsPanel(this, 0, 0, 450, 600); 
        this.add.existing(this.cardDetailsPanel);
        this.cardDetailsPanel.updatePanel(null)

        this.input.keyboard?.on('keydown-ESC', () => {
            if (!this.scene.isActive('EscapeMenu')) {
                this.scene.launch('EscapeMenu');
            }
        });

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
        // TODO: maybe use already existing DeckDisplayModal class
        // this.createDeckDisplay();
        // this.displayDeck(playerDeck);

        this.deckDisplay = new DeckDisplayModal(this, 5, 720, 500, 800, false); 
        this.add.existing(this.deckDisplay.container);
        this.deckDisplay.displayDeck(playerDeck, "playerDeck"); 
        this.deckDisplay.container.setDepth(100); 
        // Handle scroll input for deck
        // this.input.on('wheel', (pointer: Phaser.Input.Pointer, _currentlyOver: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
        //     if (this.isPointerInsideDeck(pointer)) {
        //         this.handleScroll(dy);
        //     }
        // });
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
    
    private displayDeck(deck: Card[]) {
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
    
            // Get the card ID from the deck array and use it to look up the card data
            if (i < deck.length) {
                const cardId = deck[i]; // The deck has just card IDs (like "1", "2", "3", etc.)
    
                // Find the card data using the card ID
                const fullCardData = this.getCardDataById(cardId.toString());
    
                // Handle the case where fullCardData might be undefined
                if (!fullCardData) {
                    console.warn(`Card with ID ${cardId} not found in card data.`);
                    continue; // Skip this iteration and go to the next card
                }
    
                // Create the card object using the full card data
                const cardDetails = new Card(
                    fullCardData.id,
                    fullCardData.type,
                    fullCardData.name,
                    fullCardData.movement ?? 0,
                    fullCardData.damage ?? 0,
                    fullCardData.ranged_damage ?? 0,
                    fullCardData.range ?? 0,
                    fullCardData.hp ?? 0,
                    fullCardData.cost ?? 0,
                    fullCardData.description ?? "",
                    fullCardData.imagePath,
                    fullCardData.keywords || []
                );
    
                const cardImage = this.add.image(slotX + slotWidth / 2, slotY + slotHeight / 2, fullCardData.imagePath)
                    .setDisplaySize(slotWidth, slotHeight)
                    .setInteractive();
    
                this.deckContainer.add(cardImage);
                this.cards.push(cardImage);
    
                // Card interactions
                cardImage.on('pointerover', () => {
                    this.cardDetailsPanel.updatePanel(cardDetails);  // Pass the full card details
                    slotBackground.setStrokeStyle(5, 0x00cc00);
                });

                cardImage.on('pointerout', () => {
                    this.cardDetailsPanel.updatePanel(null);
                    slotBackground.setStrokeStyle(2, 0xffffff);
                });

                cardImage.on('pointerdown', () => {
                    GameStateManager.getInstance().setSelectedCard(cardDetails);
                    console.log(`Selected card: ${cardDetails.name}`);
                });
            }
        }
    }
    
    // Helper function to map card ID to the full card data (using the imported JSON)
    private getCardDataById(id: string) {
        return cardData.find((card: any) => card.id === id);
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

    // TODO not used
    removeCardFromDeck(card: Card) {
    // Find the card in the deck array
    const player = GameStateManager.getInstance().getPlayer1();
    if (!player) return;

    const deck = player.getDeck();
    const index = deck.findIndex((c) => c.id === card.id);

    if (index !== -1) {
        // Remove from player's deck
        deck.splice(index, 1);

        // Remove from the display
        const cardImage = this.cards[index];
        if (cardImage) {
            cardImage.destroy();
            this.cards.splice(index, 1);
        }

        // Refresh display (optional)
        this.deckContainer.removeAll(true);
        this.displayDeck(deck);
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
