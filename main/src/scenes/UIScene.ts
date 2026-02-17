import { GameStateManager } from "../state/GameStateManager";
import { DeckDisplayModal } from "../utils/DeckDisplayModal";
import schemeData from '../../../public/schemeData.json';
import { Card } from "../entities/Card";
import { createPlayerContainer } from "../utils/helpers/playerContainer";
import { GameEventEmitter, GameEventType, StateChangedEvent, TurnEndedEvent } from "../core/events/GameEvents";
import { buttonOutStroke, buttonOutStyle, buttonOverStroke, buttonOverStyle, buttonUpStroke, buttonUpStyle } from "../utils/styles";

// main game UI scene
export class UIScene extends Phaser.Scene {
    private player1Timer: Phaser.GameObjects.Text;
    private player1Name: Phaser.GameObjects.Text;
    private player2Timer: Phaser.GameObjects.Text;
    private player2Name: Phaser.GameObjects.Text;
    private turnCounterText: Phaser.GameObjects.Text;
    private deckDisplay: DeckDisplayModal;
    private schemeDeckDisplay: DeckDisplayModal;
    private deckModalButton: Phaser.GameObjects.Text;
    private schemeDeckModalButton: Phaser.GameObjects.Text;
    private overlay: Phaser.GameObjects.Rectangle;
    private modalContainer: Phaser.GameObjects.Container;
    private graveyard: Phaser.GameObjects.Image;
    private graveyardDeckDisplay: DeckDisplayModal;
    private endTurnButton: Phaser.GameObjects.Text;
    private backButton: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'UIScene' });
    }

    preload() {
        this.load.image('demoGraveyard', '/assets/demoGraveyard.png');
    }

    create() {
        this.createButtons();

        const player1 = GameStateManager.getInstance().getPlayer1();
        const player2 = GameStateManager.getInstance().getPlayer2();

        const playerDeck = player1 ? player1.getDeck() : [];
        
         // Convert schemeData to Card objects
        const schemeDeck: Card[] = schemeData.map((cardData: any) => {
            return new Card(
                cardData.id,
                cardData.type,
                cardData.name,
                cardData.movement ?? 0,
                cardData.damage ?? 0,
                cardData.ranged_damage ?? 0,
                cardData.range ?? 0,
                cardData.hp ?? 0,
                (cardData as any).actions ?? (cardData as any).cost ?? 0,
                cardData.description ?? "",
                cardData.imagePath,
                cardData.keywords || []
            );
        });

        const { container: player1Container, playerTimer: player1Timer } = createPlayerContainer(this, 1800, 60, player1);
        const { container: player2Container, playerTimer: player2Timer } = createPlayerContainer(this, 1800, 1000, player2);

        this.player1Timer = player1Timer;
        this.player2Timer = player2Timer;

        this.add.existing(player1Container);
        this.add.existing(player2Container);

        const turnCounterText = this.add.text(500, 520, `Turn: ${GameStateManager.getInstance().getTurnCounter()}`, {
            font: '32px Arial',
            color: '#ffffff'
        });
    
        this.turnCounterText = turnCounterText; // Store it for updating in `update()`

        this.deckModalButton = this.styleButton(
            this.add.text(500, 100, "View Deck", { fontSize: '36px', color: '#ffffff', strokeThickness: 2 })
        );
        this.deckModalButton.on('pointerdown', () => this.deckDisplay.toggle());

        this.deckDisplay = new DeckDisplayModal(this, 10, 100, 600, 800, true);
        this.deckDisplay.displayDeck(playerDeck, "playerDeck");

        this.schemeDeckDisplay = new DeckDisplayModal(this, 10, 100, 600, 800, true);
        this.schemeDeckDisplay.displayDeck(schemeDeck, "schemeDeck");

        this.graveyardDeckDisplay = new DeckDisplayModal(this, 10, 100, 600, 800, true);
        const graveyard = this.add.image(570, 980, 'demoGraveyard');
        graveyard.setInteractive().on('pointerdown', () => this.graveyardDeckDisplay.toggle());
        
        // Set up event listeners instead of polling
        this.setupEventListeners();
        
        // Start player timer countdown
        // TODO set this to start after deployment
        this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                try {
                    const player1 = GameStateManager.getInstance().getPlayer1();
                    if (player1 && typeof player1.countSeconds === 'function') {
                        player1.countSeconds(true);
                    }
                } catch (error) {
                    console.error("Error updating player timer:", error);
                }
            }
        });
        
        // Initial update
        this.updateUI();
    }
    
    /**
     * Apply interactive button styling (hover, out, up) to a text button
     */
    private styleButton(button: Phaser.GameObjects.Text): Phaser.GameObjects.Text {
        return button
            .setInteractive()
            .on('pointerover', () => {
                button.setStroke(buttonOverStroke.colour, buttonOverStroke.thickness);
                button.setStyle(buttonOverStyle);
            })
            .on('pointerout', () => {
                button.setStroke(buttonOutStroke.colour, buttonOutStroke.thickness);
                button.setStyle(buttonOutStyle);
            })
            .on('pointerup', () => {
                button.setStroke(buttonUpStroke.colour, buttonUpStroke.thickness);
                button.setStyle(buttonUpStyle);
            });
    }
    
    private createButtons() {
        this.endTurnButton = this.styleButton(
            this.add.text(1700, 480, 'End Turn', { fontSize: '36px', color: '#ffffff', strokeThickness: 2 })
        );

        this.backButton = this.styleButton(
            this.add.text(1750, 580, 'Back', { fontSize: '36px', color: '#ffffff', strokeThickness: 2 })
        );
    }
    
    private setupEventListeners() {
        // Listen for state changes
        GameEventEmitter.on(GameEventType.STATE_CHANGED, (event: StateChangedEvent) => {
            this.updateUI();
        }, this);
        
        // Listen for turn changes
        GameEventEmitter.on(GameEventType.TURN_ENDED, (event: TurnEndedEvent) => {
            this.updateUI();
        }, this);
    }
    
    private updateUI() {
        const gameState = GameStateManager.getInstance().getGameState();
        if (!gameState) return;
        
        const player1 = gameState.players[Object.keys(gameState.players)[0]];
        const player2 = gameState.players[Object.keys(gameState.players)[1]];
        
        if (player1 && this.player1Timer) {
            this.player1Timer.setText(player1.getPlayerRemainingTime().toString());
        }

        if (player2 && this.player2Timer) {
            this.player2Timer.setText(player2.getPlayerRemainingTime().toString());
        }

        if (this.turnCounterText) {
            this.turnCounterText.setText(`Turn: ${gameState.turnCounter}`);
        }
    }

    update() {
        // Still poll for timer updates (since timer counts down every second)
        // In a fully event-driven system, we'd emit timer events, but for now this is fine
        const gameState = GameStateManager.getInstance().getGameState();
        if (gameState) {
            const player1 = gameState.players[Object.keys(gameState.players)[0]];
            const player2 = gameState.players[Object.keys(gameState.players)[1]];
            
            if (player1 && this.player1Timer) {
                this.player1Timer.setText(player1.getPlayerRemainingTime().toString());
            }

            if (player2 && this.player2Timer) {
                this.player2Timer.setText(player2.getPlayerRemainingTime().toString());
            }
        }
    }

    
}