import { DeckBuilderScene } from './scenes/DeckBuilderScene';
import { MenuScene } from './scenes/MenuScene';
import { MapScene } from './scenes/MapScene';

import Phaser from 'phaser';

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            fps: 30,
            gravity: { y: 0, x: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        // autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [MenuScene, DeckBuilderScene, MapScene]
};

export default new Phaser.Game(config);
