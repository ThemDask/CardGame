import { createBackButton } from "../utils/helpers/backButton";
import { GameStateManager } from "../state/GameStateManager";
import { DeckDisplayModal } from "../utils/DeckDisplayModal";
// UIScene with Back Button
export class UIScene extends Phaser.Scene {
    private player1Timer: Phaser.GameObjects.Text;
    private player1Name: Phaser.GameObjects.Text;
    private player2Timer: Phaser.GameObjects.Text;
    private player2Name: Phaser.GameObjects.Text;
    private turnCounterText: Phaser.GameObjects.Text;
    private deckDisplay: DeckDisplayModal;
    private modalButton: Phaser.GameObjects.Text;
    private overlay: Phaser.GameObjects.Rectangle;
    private modalContainer: Phaser.GameObjects.Container;
    
    constructor() {
        super({ key: 'UIScene' });
    }

    preload() {

    }

    create() {
        createBackButton(this)

        const player1 = GameStateManager.getInstance().getPlayer1();
        const player2 = GameStateManager.getInstance().getPlayer2();

        const playerDeck = player1 ? player1.getDeck() : [];
    
        // Container for Player 1
        const player1Container = this.add.container(1800, 60); // Adjust position as needed
        const player1Background = this.add.rectangle(0, 0, 200, 100, 0x000000); // Background (black fill, change if desired)
        player1Background.setStrokeStyle(2, 0xffffff); // White border with 2px thickness
    
        this.player1Name = this.add.text(0, -20, player1 ? player1.getName() : '-', { font: '32px Arial', color: '#ffffff' });
        this.player1Timer = this.add.text(0, 20, player1 ? player1.getPlayerRemainingTime().toString() : '0', { font: '32px Arial', color: '#ffffff' });
    
        // Add elements to player1Container
        player1Container.add([player1Background, this.player1Name, this.player1Timer]);
        
        // Adjust text alignment within container
        this.player1Name.setOrigin(0.5, 0.5);
        this.player1Timer.setOrigin(0.5, 0.5);

         // Container for Player 2
        const player2Container = this.add.container(1800, 1000); // Adjust position as needed
        const player2Background = this.add.rectangle(0, 0, 200, 100, 0x000000);
        player2Background.setStrokeStyle(2, 0xffffff); // White border with 2px thickness

        this.player2Name = this.add.text(0, -20, player2 ? player2.getName() : '-', { font: '32px Arial', color: '#ffffff' });
        this.player2Timer = this.add.text(0, 20, player2 ? player2.getPlayerRemainingTime().toString() : '0', { font: '32px Arial', color: '#ffffff' });

        // Add elements to player2Container
        player2Container.add([player2Background, this.player2Name, this.player2Timer]);

        // Adjust text alignment within container
        this.player2Name.setOrigin(0.5, 0.5);
        this.player2Timer.setOrigin(0.5, 0.5);

        const turnCounterText = this.add.text(500, 520, `Turn: ${GameStateManager.getInstance().getTurnCounter()}`, {
            font: '32px Arial',
            color: '#ffffff'
        });
    
        this.turnCounterText = turnCounterText; // Store it for updating in `update()`

        this.modalButton = this.add.text(500, 100, "Show Deck", { font: '32px Arial', color: "#fff" });
        // FIX -> no toglle and displayDeck
        this.modalButton.setInteractive().on('pointerdown', () => this.deckDisplay.toggle());

        // Create the deck display modal
        this.deckDisplay = new DeckDisplayModal(this, 300, 100, 600, 800);
        this.deckDisplay.displayDeck(playerDeck);


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