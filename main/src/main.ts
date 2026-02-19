import { DeckBuilderScene } from './scenes/DeckBuilderScene';
import { MenuScene } from './scenes/MenuScene';
import { DraftScene } from './scenes/DraftScene';
import { MapScene } from './scenes/mapscene';
import { UIScene } from './scenes/UIScene';
import { DeploymentScene } from './scenes/DeploymentScene';
import { EscapeMenu } from './utils/EscapeMenu';
import Phaser from 'phaser';


const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: 'game-container',
    dom: {
        createContainer: true, // Enable DOM container
    },
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
    scene: [MenuScene, DeckBuilderScene, DraftScene, MapScene, UIScene, DeploymentScene, EscapeMenu]
};

export default new Phaser.Game(config);
