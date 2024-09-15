// import Phaser from 'phaser';
// import MainScene from './scenes/MainScene';
// import CombatScene from './scenes/CombatScene';
// import UIScene from './scenes/UIScene';
// Import other scenes...
import Phaser from 'phaser';
// Define the game config using TypeScript's types
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1076,
    physics: {
        default: 'arcade',
        arcade: {
            fps: 60,
            gravity: { y: 0, x: 0 },
            debug: false
        }
    },
    scene: [/*MainScene, CombatScene, UIScene  add other scenes */]
};

const game = new Phaser.Game(config);

export default game;
