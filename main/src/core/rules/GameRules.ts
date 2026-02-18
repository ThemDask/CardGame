import { GameState } from "../state/GameState";
import { HexData } from "../state/HexData";

/**
 * Deterministic game rules
 * All game logic should be here - can run on both client and server
 */
export class GameRules {

    /**
     * Get the valid neighbors of a hex in the variable-width centered hex grid.
     * 
     * Adjacency rules for this diamond-shaped grid [5,6,7,8,7,6,5]:
     * - Same row: (row, col-1) and (row, col+1)
     * - Adjacent row that is WIDER (more hexes): (r', col) and (r', col+1)
     * - Adjacent row that is NARROWER (fewer hexes): (r', col-1) and (r', col)
     */
    static getNeighbors(hexMap: HexData[][], row: number, col: number): { row: number; col: number }[] {
        const neighbors: { row: number; col: number }[] = [];
        const currentRowLen = hexMap[row]?.length;
        if (currentRowLen === undefined) return neighbors;

        // Same row neighbors
        if (col - 1 >= 0) {
            neighbors.push({ row, col: col - 1 });
        }
        if (col + 1 < currentRowLen) {
            neighbors.push({ row, col: col + 1 });
        }

        // Row above (row - 1)
        if (row - 1 >= 0) {
            const aboveRowLen = hexMap[row - 1].length;
            if (aboveRowLen > currentRowLen) {
                // Wider row above: neighbors are (row-1, col) and (row-1, col+1)
                if (col >= 0 && col < aboveRowLen) {
                    neighbors.push({ row: row - 1, col });
                }
                if (col + 1 >= 0 && col + 1 < aboveRowLen) {
                    neighbors.push({ row: row - 1, col: col + 1 });
                }
            } else {
                // Narrower (or equal) row above: neighbors are (row-1, col-1) and (row-1, col)
                if (col - 1 >= 0 && col - 1 < aboveRowLen) {
                    neighbors.push({ row: row - 1, col: col - 1 });
                }
                if (col >= 0 && col < aboveRowLen) {
                    neighbors.push({ row: row - 1, col });
                }
            }
        }

        // Row below (row + 1)
        if (row + 1 < hexMap.length) {
            const belowRowLen = hexMap[row + 1].length;
            if (belowRowLen > currentRowLen) {
                // Wider row below: neighbors are (row+1, col) and (row+1, col+1)
                if (col >= 0 && col < belowRowLen) {
                    neighbors.push({ row: row + 1, col });
                }
                if (col + 1 >= 0 && col + 1 < belowRowLen) {
                    neighbors.push({ row: row + 1, col: col + 1 });
                }
            } else {
                // Narrower (or equal) row below: neighbors are (row+1, col-1) and (row+1, col)
                if (col - 1 >= 0 && col - 1 < belowRowLen) {
                    neighbors.push({ row: row + 1, col: col - 1 });
                }
                if (col >= 0 && col < belowRowLen) {
                    neighbors.push({ row: row + 1, col });
                }
            }
        }

        return neighbors;
    }

    /**
     * Calculate shortest distance between two hexes using BFS.
     * Returns -1 if no path exists.
     */
    static getHexDistance(hexMap: HexData[][], fromRow: number, fromCol: number, toRow: number, toCol: number): number {
        if (fromRow === toRow && fromCol === toCol) return 0;

        const visited = new Set<string>();
        const queue: { row: number; col: number; dist: number }[] = [{ row: fromRow, col: fromCol, dist: 0 }];
        visited.add(`${fromRow},${fromCol}`);

        while (queue.length > 0) {
            const current = queue.shift()!;

            for (const neighbor of this.getNeighbors(hexMap, current.row, current.col)) {
                const key = `${neighbor.row},${neighbor.col}`;
                if (visited.has(key)) continue;
                visited.add(key);

                if (neighbor.row === toRow && neighbor.col === toCol) {
                    return current.dist + 1;
                }

                queue.push({ row: neighbor.row, col: neighbor.col, dist: current.dist + 1 });
            }
        }

        return -1; // No path found
    }

    /**
     * Get all hexes reachable by a card from a given position within its movement range.
     * Uses BFS flood fill. Does NOT traverse through occupied hexes (can't move through other cards),
     * but enemy-occupied hexes at the frontier are still marked as 'attack' targets.
     */
    static getReachableHexes(
        state: GameState,
        fromRow: number,
        fromCol: number,
        movement: number,
        playerId: string
    ): { row: number; col: number; type: 'movement' | 'attack' }[] {
        const result: { row: number; col: number; type: 'movement' | 'attack' }[] = [];
        const visited = new Set<string>();
        const queue: { row: number; col: number; dist: number }[] = [{ row: fromRow, col: fromCol, dist: 0 }];
        visited.add(`${fromRow},${fromCol}`);

        while (queue.length > 0) {
            const current = queue.shift()!;
            if (current.dist >= movement) continue;

            for (const neighbor of this.getNeighbors(state.hexMap, current.row, current.col)) {
                const key = `${neighbor.row},${neighbor.col}`;
                if (visited.has(key)) continue;
                visited.add(key);

                const hex = state.hexMap[neighbor.row]?.[neighbor.col];
                if (!hex) continue;

                if (!hex.occupied) {
                    // Empty hex - can move here
                    result.push({ row: neighbor.row, col: neighbor.col, type: 'movement' });
                    // Continue BFS through empty hexes
                    queue.push({ row: neighbor.row, col: neighbor.col, dist: current.dist + 1 });
                } else if (hex.occupiedByPlayerId && hex.occupiedByPlayerId !== playerId) {
                    // Enemy-occupied hex - can attack but not traverse through
                    result.push({ row: neighbor.row, col: neighbor.col, type: 'attack' });
                }
                // Friendly-occupied hexes: can't move there or through
            }
        }

        return result;
    }

    /**
     * Check if a card can move/attack from one hex to another
     */
    static canMoveCard(
        state: GameState,
        playerId: string,
        fromRow: number,
        fromCol: number,
        toRow: number,
        toCol: number
    ): { valid: boolean; reason?: string } {
        // Check it's the player's turn
        if (state.currentPlayerId !== playerId) {
            return { valid: false, reason: "Not your turn" };
        }

        // Check source hex exists and has player's card
        const sourceHex = state.hexMap[fromRow]?.[fromCol];
        if (!sourceHex || !sourceHex.occupied || !sourceHex.occupiedBy) {
            return { valid: false, reason: "No card at source position" };
        }
        if (sourceHex.occupiedByPlayerId !== playerId) {
            return { valid: false, reason: "Card does not belong to you" };
        }

        const card = sourceHex.occupiedBy;

        // Check card has remaining actions
        if ((card.remainingActions ?? card.actions) <= 0) {
            return { valid: false, reason: "Card has no actions remaining" };
        }

        // Check target hex exists
        const targetHex = state.hexMap[toRow]?.[toCol];
        if (!targetHex) {
            return { valid: false, reason: "Target hex does not exist" };
        }

        // Target must be empty or occupied by enemy
        if (targetHex.occupied && targetHex.occupiedByPlayerId === playerId) {
            return { valid: false, reason: "Cannot move to a hex occupied by your own card" };
        }

        // Check target is within reachable hexes (BFS handles pathing)
        const reachable = this.getReachableHexes(state, fromRow, fromCol, card.movement, playerId);
        const isReachable = reachable.some(h => h.row === toRow && h.col === toCol);
        if (!isReachable) {
            return { valid: false, reason: "Target hex is out of movement range" };
        }

        return { valid: true };
    }

    /**
     * Get all hexes that can be shot at from a given position within range.
     * Only hexes with enemy cards within range (using getHexDistance) are eligible.
     */
    static getShootableHexes(
        state: GameState,
        fromRow: number,
        fromCol: number,
        range: number,
        playerId: string
    ): { row: number; col: number }[] {
        const result: { row: number; col: number }[] = [];
        if (range <= 0) return result;

        for (let r = 0; r < state.hexMap.length; r++) {
            for (let c = 0; c < state.hexMap[r].length; c++) {
                const hex = state.hexMap[r]?.[c];
                if (!hex || !hex.occupied || !hex.occupiedByPlayerId || hex.occupiedByPlayerId === playerId) {
                    continue;
                }
                const distance = this.getHexDistance(state.hexMap, fromRow, fromCol, r, c);
                if (distance >= 1 && distance <= range) {
                    result.push({ row: r, col: c });
                }
            }
        }
        return result;
    }

    /**
     * Check if a card can shoot at a target hex
     */
    static canShootCard(
        state: GameState,
        playerId: string,
        fromRow: number,
        fromCol: number,
        toRow: number,
        toCol: number
    ): { valid: boolean; reason?: string } {
        if (state.currentPlayerId !== playerId) {
            return { valid: false, reason: "Not your turn" };
        }

        const sourceHex = state.hexMap[fromRow]?.[fromCol];
        if (!sourceHex || !sourceHex.occupied || !sourceHex.occupiedBy) {
            return { valid: false, reason: "No card at source position" };
        }
        if (sourceHex.occupiedByPlayerId !== playerId) {
            return { valid: false, reason: "Card does not belong to you" };
        }

        const card = sourceHex.occupiedBy;
        if ((card.remainingActions ?? card.actions) <= 0) {
            return { valid: false, reason: "Card has no actions remaining" };
        }
        if ((card.range ?? 0) <= 0) {
            return { valid: false, reason: "Card has no range" };
        }
        if ((card.ranged_damage ?? 0) <= 0) {
            return { valid: false, reason: "Card has no ranged damage" };
        }

        const targetHex = state.hexMap[toRow]?.[toCol];
        if (!targetHex) {
            return { valid: false, reason: "Target hex does not exist" };
        }
        if (!targetHex.occupied || !targetHex.occupiedByPlayerId || targetHex.occupiedByPlayerId === playerId) {
            return { valid: false, reason: "Target must be an enemy card" };
        }

        const distance = this.getHexDistance(state.hexMap, fromRow, fromCol, toRow, toCol);
        if (distance < 1 || distance > card.range) {
            return { valid: false, reason: "Target is out of range" };
        }

        return { valid: true };
    }

    /**
     * Check if a card can be placed on a hex
     */
    static canPlaceCard(
        state: GameState,
        playerId: string,
        cardId: string,
        hexRow: number,
        hexCol: number
    ): { valid: boolean; reason?: string } {
        // Check if hex exists
        if (!state.hexMap[hexRow] || !state.hexMap[hexRow][hexCol]) {
            return { valid: false, reason: "Hex does not exist" };
        }

        const hex = state.hexMap[hexRow][hexCol];

        // Check if hex is occupied
        if (hex.occupied) {
            return { valid: false, reason: "Hex is already occupied" };
        }

        // Check if it's player's turn
        if (state.currentPlayerId !== playerId) {
            return { valid: false, reason: "Not your turn" };
        }

        // Check if player owns the card
        const player = state.players[playerId];
        if (!player) {
            return { valid: false, reason: "Player not found" };
        }

        const card = player.deck.find(c => c.id === cardId);
        if (!card) {
            return { valid: false, reason: "Card not in player's deck" };
        }

        // Check deployment restrictions: can only deploy on deploy-type hexes during deployment phase
        const isDeploymentPhase = state.gamePhase === 'deployment';
        
        if (isDeploymentPhase) {
            // During deployment, only allow placement on deploy hexes (land or water)
            if (hex.type !== 'landDeploy' && hex.type !== 'water') {
                return { valid: false, reason: "Can only deploy on deployment zones" };
            }
            
            // Check if marine units can only be placed on water
            if (card.keywords && card.keywords.some((kw: string) => kw.includes('Marine'))) {
                if (hex.type !== 'water') {
                    return { valid: false, reason: "Marine units can only be deployed on water" };
                }
            }
        }

        return { valid: true };
    }
}
