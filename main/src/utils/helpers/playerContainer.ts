import { Player } from "../../entities/Player";

export function createPlayerContainer(
    scene: Phaser.Scene, 
    x: number, 
    y: number, 
    player: Player | null
    ): 
    { container: Phaser.GameObjects.Container, playerName: Phaser.GameObjects.Text, playerTimer: Phaser.GameObjects.Text, playerGoldText: Phaser.GameObjects.Text } {
    const container = scene.add.container(x, y);
    const background = scene.add.rectangle(0, 0, 200, 100, 0x000000);
    background.setStrokeStyle(2, 0xffffff);

    const playerName = scene.add.text(0, -20, player ? player.getName() : '-', { font: '32px Arial', color: '#ffffff' });
    const playerTimer = scene.add.text(60, 20, player ? player.getPlayerRemainingTime().toString() : '0', { font: '32px Arial', color: '#ffffff' });
    const playerGoldText = scene.add.text(-90, 3, 'G: '.concat(player ? player.getGold().toString() : '0'), { font: '32px Arial', color: '#ffffff' });

    // Adjust text alignment
    playerName.setOrigin(0.5, 0.5);
    playerTimer.setOrigin(0.5, 0.5);

    // Add elements to the container
    container.add([background, playerName, playerTimer, playerGoldText]);

    // Return the container and text elements for easy access
    return { container, playerName, playerTimer, playerGoldText };
}
