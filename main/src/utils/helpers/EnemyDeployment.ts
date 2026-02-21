import { Card } from "../../entities/Card";
import { Hex } from "../../entities/Hex";
import cardData from '../../../../public/cardData.json';

/**
 * Helper to create a default enemy deck and deployment positions
 */
export class EnemyDeployment {
    /**
     * Create default enemy deck (simple starter deck)
     */
    static createEnemyDeck(): Card[] {
        // Select a few starter cards for the enemy
        const enemyCardIds = ["1", "2", "3", "4", "5"]; // Simple starter cards
        
        return enemyCardIds.map(id => {
            const cardDataItem = (cardData as any[]).find(c => c.id === id);
            if (!cardDataItem) {
                throw new Error(`Card with ID ${id} not found`);
            }
            return new Card(
                cardDataItem.id,
                cardDataItem.type,
                cardDataItem.name,
                cardDataItem.movement ?? 0,
                cardDataItem.damage ?? 0,
                cardDataItem.ranged_damage ?? 0,
                cardDataItem.range ?? 0,
                cardDataItem.hp ?? 0,
                (cardDataItem as any).actions ?? (cardDataItem as any).cost ?? 0,
                cardDataItem.description ?? "",
                cardDataItem.imagePath,
                cardDataItem.keywords || []
            );
        });
    }

    /**
     * Get deployment positions for enemy cards (top rows of hex map)
     * Returns array of {row, col} positions
     */
    static getEnemyDeploymentPositions(hexMapConfig: Array<Array<any>>): Array<{row: number, col: number}> {
        const positions: Array<{row: number, col: number}> = [];
        
        // Deploy on top rows (rows 0-2, which are landDeploy hexes)
        // Row 0: ['landDeploy', 'landDeploy', 'landDeploy', ...]
        // Row 1: ['landDeploy', 'landDeploy', 'landDeploy', ...]
        // Row 2: ['land', 'landDeploy', 'waterDeploy', ...]
        
        for (let row = 0; row < Math.min(3, hexMapConfig.length) && positions.length < 5; row++) {
            for (let col = 0; col < hexMapConfig[row].length && positions.length < 5; col++) {
                const hexType = hexMapConfig[row][col];
                // Only deploy on landDeploy hexes (enemy side)
                if (hexType === 'landDeploy') {
                    positions.push({ row, col });
                }
            }
        }
        
        return positions;
    }
    
    /**
     * Get deployment positions for player cards (bottom rows of hex map)
     * Returns array of {row, col} positions
     */
    static getPlayerDeploymentPositions(hexMapConfig: Array<Array<any>>): Array<{row: number, col: number}> {
        const positions: Array<{row: number, col: number}> = [];
        
        // Deploy on bottom rows (rows 8-10, which are landDeploy hexes)
        // Row 8: ['land', 'landDeploy', 'waterDeploy', ...]
        // Row 9: ['landDeploy', 'landDeploy', ...]
        // Row 10: ['landDeploy', 'landDeploy', ...]
        
        const startRow = Math.max(0, hexMapConfig.length - 3);
        for (let row = startRow; row < hexMapConfig.length && positions.length < 20; row++) {
            for (let col = 0; col < hexMapConfig[row].length && positions.length < 20; col++) {
                const hexType = hexMapConfig[row][col];
                // Only deploy on landDeploy or waterDeploy hexes (player side)
                if (hexType === 'landDeploy' || hexType === 'waterDeploy') {
                    positions.push({ row, col });
                }
            }
        }
        
        return positions;
    }
}
