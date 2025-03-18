import { createBackButton } from "../utils/helpers/backButton";
import { GameStateManager } from "../state/GameStateManager";
import { DeckDisplayModal } from "../utils/DeckDisplayModal";
import schemeData from '../../../public/schemeData.json';
import { Card } from "../entities/Card";
import { createPlayerContainer } from "../utils/helpers/playerContainer";

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
    private player1GoldText: Phaser.GameObjects.Text;
    private player2GoldText: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'UIScene' });
    }

    preload() {
        this.load.image('demoGraveyard', '/assets/demoGraveyard.png');
    }

    create() {
        createBackButton(this)

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
                cardData.cost ?? 0,
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

        this.deckModalButton = this.add.text(500, 100, "View Deck", { font: '32px Arial', color: "#fff" });
        // FIX -> no toglle and displayDeck
        this.deckModalButton.setInteractive().on('pointerdown', () => this.deckDisplay.toggle());

        this.schemeDeckModalButton = this.add.text(500, 800, "View Scheme Deck", { font: '32px Arial', color: "#fff" });
        this.schemeDeckModalButton.setInteractive().on('pointerdown', () => this.schemeDeckDisplay.toggle());

        this.deckDisplay = new DeckDisplayModal(this, 10, 100, 600, 800, true);
        this.deckDisplay.displayDeck(playerDeck, "playerDeck");

        this.schemeDeckDisplay = new DeckDisplayModal(this, 10, 100, 600, 800, true);
        this.schemeDeckDisplay.displayDeck(schemeDeck, "schemeDeck");

        this.graveyardDeckDisplay = new DeckDisplayModal(this, 10, 100, 600, 800, true);
        const graveyard = this.add.image(520, 980, 'demoGraveyard');
        graveyard.setInteractive().on('pointerdown', () => this.graveyardDeckDisplay.toggle());
    }

    update() {
        const player1 = GameStateManager.getInstance().getPlayer1();
        if (player1) {
            this.player1Timer.setText(player1.getPlayerRemainingTime().toString());
        }

        const player2 = GameStateManager.getInstance().getPlayer2();
        if (player2) {
            this.player2Timer.setText(player2.getPlayerRemainingTime().toString());
        }

        const currentTurn = GameStateManager.getInstance().getTurnCounter();
        this.turnCounterText.setText(`Turn: ${currentTurn}`);
    }

    
}