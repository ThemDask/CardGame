import { Mapscene } from './scenes/MapScene';

// Import other scenes...
import Phaser from 'phaser';
// Define the game config using TypeScript's types
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            fps: 60,
            gravity: { y: 0, x: 0 },
            debug: false
        }
    },
    scene: [Mapscene]
};

export default new Phaser.Game(config);
