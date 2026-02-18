import { DeckDisplayModal } from "../utils/DeckDisplayModal";
import { Player } from "../entities/Player";
import { createBackButton } from "../utils/helpers/backButton";
import { sceneManager } from "../core/sceneManager";
import { GameStateManager } from "../state/GameStateManager";
import { Card } from "../entities/Card";
import { createPlayerContainer } from "../utils/helpers/playerContainer";
import { CardDetailsPanel } from "../utils/CardDetailsPanel";
import cardData from '../../../public/cardData.json';
import { GameEventEmitter, GameEventType, StateChangedEvent } from "../core/events/GameEvents";

export class DeploymentScene extends Phaser.Scene {
    private player1Timer: Phaser.GameObjects.Text;
    private player2Timer: Phaser.GameObjects.Text;
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
            sceneManager.openEscapeMenu(this);
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
        this.createDeckDisplay();
        this.displayDeck(playerDeck);

        // this.deckDisplay = new DeckDisplayModal(this, 5, 720, 500, 800, false); 
        // this.add.existing(this.deckDisplay.container);
        // this.deckDisplay.displayDeck(playerDeck, "playerDeck"); 
        // this.deckDisplay.container.setDepth(100); 
        // Handle scroll input for deck
        this.input.on('wheel', (pointer: Phaser.Input.Pointer, _currentlyOver: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
            if (this.isPointerInsideDeck(pointer)) {
                this.handleScroll(dy);
            }
        });
        
        // Set up event listeners for state changes
        this.setupEventListeners();
    }
    
    private setupEventListeners() {
        // Listen for state changes to update deck display
        GameEventEmitter.on(GameEventType.STATE_CHANGED, (event: StateChangedEvent) => {
            const gameState = GameStateManager.getInstance().getGameState();
            if (gameState) {
                const currentPlayer = gameState.players[gameState.currentPlayerId];
                if (currentPlayer) {
                    // Reconstruct player to get proper instance with methods
                    const player = GameStateManager.getInstance().getPlayer1();
                    if (player && currentPlayer.name === player.name) {
                        this.refreshDeckDisplay(player.getDeck());
                    }
                }
            }
        }, this);
        
        // Listen for card placed events to immediately update display
        GameEventEmitter.on(GameEventType.CARD_PLACED, (event: any) => {
            const gameState = GameStateManager.getInstance().getGameState();
            if (gameState) {
                const player = GameStateManager.getInstance().getPlayer1();
                if (player) {
                    // Immediately refresh deck display when card is placed
                    this.refreshDeckDisplay(player.getDeck());
                }
            }
        }, this);
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
        // Clear existing cards
        this.cards.forEach(card => card.destroy());
        this.cards = [];
        this.slots = [];
        this.deckContainer.removeAll(true);
        
        const slotWidth = 90; // Slightly reduced for 500px width
        const slotHeight = 110;
        const marginX = 8;
        const marginY = 15;
        const slotsPerRow = 5;
    
        // Draw deck background again
        const deckBackground = this.add.rectangle(0, 0, 500, 500)
            .setStrokeStyle(5, 0xffffff)
            .setOrigin(0);
        this.deckContainer.add(deckBackground);
    
        for (let i = 0; i < Math.max(50, deck.length); i++) { // Reduced number of slots for smaller height
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
    
            // Display card if it exists in deck
            if (i < deck.length) {
                const card = deck[i]; // Deck now contains Card objects
                
                // Use placeholder if image not loaded
                let imageKey = 'archer'; // Default placeholder
                if (card.imagePath && this.textures.exists(card.imagePath)) {
                    imageKey = card.imagePath;
                }
    
                const cardImage = this.add.image(slotX + slotWidth / 2, slotY + slotHeight / 2, imageKey)
                    .setDisplaySize(slotWidth, slotHeight)
                    .setInteractive();
    
                this.deckContainer.add(cardImage);
                this.cards.push(cardImage);
    
                // Card interactions
                cardImage.on('pointerover', () => {
                    this.cardDetailsPanel.updatePanel(card);
                    slotBackground.setStrokeStyle(5, 0x00cc00);
                });

                cardImage.on('pointerout', () => {
                    this.cardDetailsPanel.updatePanel(null);
                    slotBackground.setStrokeStyle(2, 0xffffff);
                });

                cardImage.on('pointerdown', () => {
                    GameStateManager.getInstance().setSelectedCard(card);
                    console.log(`Selected card: ${card.name}`);
                });
            }
        }
    }
    
    /**
     * Refresh deck display (called when deck changes)
     */
    private refreshDeckDisplay(deck: Card[]) {
        this.displayDeck(deck);
    }
    
    /**
     * Called when a card is placed (for immediate visual feedback)
     */
    public onCardPlaced(card: Card) {
        // Deck display will be refreshed via STATE_CHANGED event
        // This method is kept for compatibility with Hex.handleClick
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
