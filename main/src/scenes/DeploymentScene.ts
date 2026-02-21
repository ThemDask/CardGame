import { sceneManager } from "../core/sceneManager";
import { GameStateManager } from "../state/GameStateManager";
import { Card } from "../entities/Card";
import { GameEventEmitter, GameEventType, StateChangedEvent } from "../core/events/GameEvents";

export class DeploymentScene extends Phaser.Scene {
    private deckContainer: Phaser.GameObjects.Container;
    private scrollMask: Phaser.GameObjects.Graphics;
    private slots: Phaser.GameObjects.Rectangle[] = [];
    private cards: Phaser.GameObjects.Image[] = [];

    constructor() {
        super({ key: 'DeploymentScene' });
    }

    create() {
        this.input.keyboard?.on('keydown-ESC', () => {
            sceneManager.openEscapeMenu(this);
        });

        const player1 = GameStateManager.getInstance().getPlayer1();
        const playerDeck = player1 ? player1.getDeck() : [];

        this.createDeckDisplay();
        this.displayDeck(playerDeck);

        this.input.on('wheel', (pointer: Phaser.Input.Pointer, _currentlyOver: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
            if (this.isPointerInsideDeck(pointer)) {
                this.handleScroll(dy);
            }
        });

        this.setupEventListeners();
    }
    
    private setupEventListeners() {
        GameEventEmitter.on(GameEventType.STATE_CHANGED, (_event: StateChangedEvent) => {
            const gameState = GameStateManager.getInstance().getGameState();
            if (gameState) {
                const currentPlayer = gameState.players[gameState.currentPlayerId];
                if (currentPlayer) {
                    const player = GameStateManager.getInstance().getPlayer1();
                    if (player && currentPlayer.name === player.name) {
                        this.refreshDeckDisplay(player.getDeck());
                    }
                }
            }
        }, this);
        
        GameEventEmitter.on(GameEventType.CARD_PLACED, (_event: any) => {
            const player = GameStateManager.getInstance().getPlayer1();
            if (player) {
                this.refreshDeckDisplay(player.getDeck());
            }
        }, this);
    }

    private createDeckDisplay() {
        this.deckContainer = this.add.container(5, 720); 
    
        const deckBackground = this.add.rectangle(0, 0, 500, 500)
            .setStrokeStyle(5, 0xffffff)
            .setOrigin(0);

        this.deckContainer.add(deckBackground);
        this.add.existing(this.deckContainer);

        this.createScrollMask(deckBackground.width, deckBackground.height);
    }
    
    private createScrollMask(width: number, height: number) {
        this.scrollMask = this.add.graphics();
        this.scrollMask.fillStyle(0xffffff, 0);
        this.scrollMask.fillRect(5, 720, width, height);
        this.deckContainer.setMask(new Phaser.Display.Masks.GeometryMask(this, this.scrollMask));
    }
    
    private displayDeck(deck: Card[]) {
        this.cards.forEach(card => card.destroy());
        this.cards = [];
        this.slots = [];
        this.deckContainer.removeAll(true);
        
        const slotWidth = 90;
        const slotHeight = 110;
        const marginX = 8;
        const marginY = 15;
        const slotsPerRow = 5;
    
        const deckBackground = this.add.rectangle(0, 0, 500, 500)
            .setStrokeStyle(5, 0xffffff)
            .setOrigin(0);
        this.deckContainer.add(deckBackground);
    
        for (let i = 0; i < Math.max(50, deck.length); i++) {
            const row = Math.floor(i / slotsPerRow);
            const col = i % slotsPerRow;
    
            const slotX = col * (slotWidth + marginX);
            const slotY = row * (slotHeight + marginY);
    
            const slotBackground = this.add.rectangle(slotX, slotY, slotWidth, slotHeight)
                .setStrokeStyle(2, 0xffffff)
                .setOrigin(0);
            this.deckContainer.add(slotBackground);
            this.slots.push(slotBackground);
    
            if (i < deck.length) {
                const card = deck[i];
                
                let imageKey = 'archer';
                if (card.imagePath && this.textures.exists(card.imagePath)) {
                    imageKey = card.imagePath;
                }
    
                const cardImage = this.add.image(slotX + slotWidth / 2, slotY + slotHeight / 2, imageKey)
                    .setDisplaySize(slotWidth, slotHeight)
                    .setInteractive();
    
                this.deckContainer.add(cardImage);
                this.cards.push(cardImage);
    
                cardImage.on('pointerover', () => {
                    GameEventEmitter.emit(GameEventType.CARD_HOVER, card);
                    slotBackground.setStrokeStyle(5, 0x00cc00);
                });

                cardImage.on('pointerout', () => {
                    GameEventEmitter.emit(GameEventType.CARD_HOVER, null);
                    slotBackground.setStrokeStyle(2, 0xffffff);
                });

                cardImage.on('pointerdown', () => {
                    GameStateManager.getInstance().setSelectedCard(card);
                    console.log(`Selected card: ${card.name}`);
                });
            }
        }
    }
    
    private refreshDeckDisplay(deck: Card[]) {
        this.displayDeck(deck);
    }

    private isPointerInsideDeck(pointer: Phaser.Input.Pointer): boolean {
        return pointer.x >= 5 && pointer.x <= 505 && pointer.y >= 720 && pointer.y <= 1220;
    }
    
    private handleScroll(dy: number) {
        const scrollAmount = 10;
        this.deckContainer.y -= dy * scrollAmount;
    
        const minY = 720;
        const maxY = 720 - (this.cards.length / 5) * 140;
    
        if (this.deckContainer.y > minY) {
            this.deckContainer.y = minY;
        } else if (this.deckContainer.y < maxY) {
            this.deckContainer.y = maxY;
        }
    }
}
