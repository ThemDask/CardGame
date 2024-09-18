import { DeckBuilderScene } from './scenes/DeckBuilderScene';
import { MenuScene } from './scenes/MenuScene';

// Import other scenes...
import Phaser from 'phaser';
// Define the game config using TypeScript's types
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            fps: 60,
            gravity: { y: 0, x: 0 },
            debug: false
        }
    },
    scene: [MenuScene, DeckBuilderScene]
};

export default new Phaser.Game(config);
