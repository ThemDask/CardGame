import { GameStateManager } from "../../state/GameStateManager";
import { EnemyDeployment } from "./EnemyDeployment";
import { EndTurnAction } from "../../core/actions/EndTurnAction";
import { GameEventEmitter, GameEventType } from "../../core/events/GameEvents";
import { Card } from "../../entities/Card";
import { HexType } from "../styles";

/**
 * Handles all enemy AI logic: deployment, turn skipping, and future AI behavior.
 */
export class EnemyAI {
    private static readonly ENEMY_PLAYER_ID = "Player 2";

    /**
     * Deploy enemy cards onto the board at game start.
     * Must be called after GameStateManager.initializeGame().
     * Returns the positions that were deployed to (so MapScene can create visuals).
     */
    static deployEnemyCards(
        hexMapConfig: Array<Array<HexType>>
    ): Array<{ card: Card; row: number; col: number }> {
        const gameStateManager = GameStateManager.getInstance();
        const enemyDeck = EnemyDeployment.createEnemyDeck();
        const deploymentPositions = EnemyDeployment.getEnemyDeploymentPositions(hexMapConfig);

        if (deploymentPositions.length === 0) {
            console.warn("No deployment positions found for enemy cards");
            return [];
        }

        const numToDeploy = Math.min(enemyDeck.length, deploymentPositions.length);
        const deployedCards = enemyDeck.slice(0, numToDeploy);
        const remainingDeck = enemyDeck.slice(numToDeploy);

        // Update player2's deck with leftover cards
        const player2 = gameStateManager.getPlayer2();
        if (player2) {
            player2.deck = remainingDeck;
            gameStateManager.setPlayer2(player2);
        }

        const gameState = gameStateManager.getGameState();
        if (!gameState) {
            console.error("Game state not initialized");
            return [];
        }

        const deployed: Array<{ card: Card; row: number; col: number }> = [];

        try {
            const newState = JSON.parse(JSON.stringify(gameState));

            for (let i = 0; i < deployedCards.length; i++) {
                const card = deployedCards[i];
                const pos = deploymentPositions[i];

                if (!newState.hexMap[pos.row] || !newState.hexMap[pos.row][pos.col]) {
                    console.warn(`Invalid deployment position: row ${pos.row}, col ${pos.col}`);
                    continue;
                }

                const hex = newState.hexMap[pos.row][pos.col];
                if (hex && !hex.occupied) {
                    hex.occupied = true;
                    hex.occupiedBy = card;
                    hex.occupiedByPlayerId = this.ENEMY_PLAYER_ID;
                    deployed.push({ card, row: pos.row, col: pos.col });
                } else {
                    console.warn(`Hex at row ${pos.row}, col ${pos.col} is already occupied`);
                }
            }

            (gameStateManager as any).gameState = newState;
            (gameStateManager as any).gameState.lastUpdated = Date.now();
        } catch (error) {
            console.error("Failed to deploy enemy cards:", error);
        }

        return deployed;
    }

    /**
     * Set up a listener that auto-ends the enemy turn when it starts.
     * Call once during game setup.
     */
    static setupAutoTurn(): void {
        GameEventEmitter.on(GameEventType.TURN_STARTED, (event: any) => {
            if (!event) return;
            const { playerId } = event;
            if (playerId !== this.ENEMY_PLAYER_ID) return;

            setTimeout(() => {
                try {
                    const endTurnAction = new EndTurnAction(this.ENEMY_PLAYER_ID);
                    GameStateManager.getInstance().executeAction(endTurnAction);
                } catch (error) {
                    console.error("Failed to auto-end enemy turn:", error);
                }
            }, 1000);
        });
    }
}
