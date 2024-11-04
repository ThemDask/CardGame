import { createBackButton } from "../utils/helpers/backButton";
import { GameStateManager } from "../state/GameStateManager";
// UIScene with Back Button
export class UIScene extends Phaser.Scene {
    private player1Timer: Phaser.GameObjects.Text;
    private player1Name: Phaser.GameObjects.Text;
    constructor() {
        super({ key: 'UIScene' });
    }

    preload() {

    }

    create() {
        createBackButton(this)

        const player1 = GameStateManager.getInstance().getPlayer1();
        this.player1Name = this.add.text(1700, 100, player1 ? player1.getName() : 'No Name', { font: '32px Arial', color: '#ffffff' });
        this.player1Timer = this.add.text(1700, 50, player1 ? player1.getPlayerRemainingTime().toString() : '0', { font: '32px Arial', color: '#ffffff' });

    }

    update() {
        const player1 = GameStateManager.getInstance().getPlayer1();
        if (player1) {
            this.player1Timer.setText(player1.getPlayerRemainingTime().toString());
        }
    }

    
}