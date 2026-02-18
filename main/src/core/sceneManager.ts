import Phaser from 'phaser';
import { Card } from '../entities/Card';

/**
 * Centralized scene transition utilities.
 * Use these instead of direct scene.start/stop/launch for consistent behavior.
 */
export const sceneManager = {
    /**
     * Stop all running scenes and start MenuScene.
     * Use when exiting the game (e.g. Escape menu Exit).
     * Must use ScenePlugin (scene.scene), not game.scene - Phaser 3.50+ does not
     * handle game.scene reliably; operations must go through the plugin queue.
     * Note: isActive() returns false for launched scenes like UIScene (they run but
     * aren't the "active" input-focus scene), so we explicitly stop game-flow scenes.
     */
    exitToMenu(scene: Phaser.Scene): void {
        const plugin = scene.scene;
        const gameFlowScenes = ['MapScene', 'UIScene', 'DeploymentScene', 'EscapeMenu', 'DeckBuilderScene'];
        gameFlowScenes.forEach((k) => plugin.stop(k));
        plugin.start('MenuScene');
    },

    /**
     * Stop the given scene and start MenuScene.
     * Use for Back button from single-scene flows (e.g. DeckBuilderScene).
     */
    goToMenu(scene: Phaser.Scene): void {
        scene.scene.stop(scene.scene.key);
        scene.scene.start('MenuScene');
    },

    /**
     * Start the game flow (MapScene). MapScene will launch UIScene and DeploymentScene.
     */
    startGame(scene: Phaser.Scene, playerDeck: string[] | Card[]): void {
        scene.scene.start('MapScene', { playerDeck });
    },

    /**
     * Start DeckBuilderScene.
     */
    goToDeckBuilder(scene: Phaser.Scene): void {
        scene.scene.start('DeckBuilderScene');
    },

    /**
     * Launch EscapeMenu overlay if not already active.
     */
    openEscapeMenu(scene: Phaser.Scene): void {
        if (!scene.scene.isActive('EscapeMenu')) {
            scene.scene.launch('EscapeMenu');
        }
    },

    /**
     * Close the EscapeMenu overlay.
     */
    closeEscapeMenu(scene: Phaser.Scene): void {
        scene.scene.stop('EscapeMenu');
    },
};
