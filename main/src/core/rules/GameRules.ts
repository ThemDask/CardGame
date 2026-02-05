import { Card } from "../../entities/Card";
import { GameState } from "../state/GameState";

/**
 * Deterministic game rules
 * All game logic should be here - can run on both client and server
 */
export class GameRules {
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

        // Check if player has enough gold
        if (player.availableGold < card.cost) {
            return { valid: false, reason: "Not enough gold" };
        }

        // Check deployment restrictions: can only deploy on deploy-type hexes during deployment phase
        const isDeploymentPhase = state.gamePhase === 'deployment';
        
        if (isDeploymentPhase) {
            // During deployment, only allow placement on deploy hexes
            if (hex.type !== 'landDeploy' && hex.type !== 'waterDeploy') {
                return { valid: false, reason: "Can only deploy on deployment zones" };
            }
            
            // Check if marine units can only be placed on water
            if (card.keywords && card.keywords.some((kw: string) => kw.includes('Marine'))) {
                if (hex.type !== 'waterDeploy') {
                    return { valid: false, reason: "Marine units can only be deployed on water" };
                }
            }
        }

        return { valid: true };
    }

    /**
     * Check if a card can move from one hex to another
     */
    static canMoveCard(
        state: GameState,
        playerId: string,
        fromRow: number,
        fromCol: number,
        toRow: number,
        toCol: number
    ): { valid: boolean; reason?: string } {
        // Check if source hex exists and is occupied
        if (!state.hexMap[fromRow] || !state.hexMap[fromRow][fromCol]) {
            return { valid: false, reason: "Source hex does not exist" };
        }

        const fromHex = state.hexMap[fromRow][fromCol];
        if (!fromHex.occupied || !fromHex.occupiedBy) {
            return { valid: false, reason: "No card on source hex" };
        }

        // Check if player owns the card
        // Note: This assumes we track ownership. For now, we'll need to add this.
        // For MVP, we can check if card is in player's deck (but this won't work after placement)
        // TODO: Add ownership tracking to hex state

        // Check if destination hex exists and is not occupied
        if (!state.hexMap[toRow] || !state.hexMap[toRow][toCol]) {
            return { valid: false, reason: "Destination hex does not exist" };
        }

        const toHex = state.hexMap[toRow][toCol];
        if (toHex.occupied) {
            return { valid: false, reason: "Destination hex is occupied" };
        }

        // Check movement range (hex distance)
        const distance = this.getHexDistance(fromRow, fromCol, toRow, toCol);
        const card = fromHex.occupiedBy;
        if (distance > card.movement) {
            return { valid: false, reason: "Movement range exceeded" };
        }

        return { valid: true };
    }

    /**
     * Calculate hex distance (Manhattan-like distance for hex grids)
     */
    static getHexDistance(row1: number, col1: number, row2: number, col2: number): number {
        // Simplified hex distance calculation
        const dx = col2 - col1;
        const dy = row2 - row1;
        return Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dx - dy));
    }

    /**
     * Check if a card can attack another card
     */
    static canAttack(
        state: GameState,
        attackerRow: number,
        attackerCol: number,
        targetRow: number,
        targetCol: number
    ): { valid: boolean; reason?: string } {
        // Check if attacker exists
        const attackerHex = state.hexMap[attackerRow]?.[attackerCol];
        if (!attackerHex || !attackerHex.occupied || !attackerHex.occupiedBy) {
            return { valid: false, reason: "Attacker not found" };
        }

        // Check if target exists
        const targetHex = state.hexMap[targetRow]?.[targetCol];
        if (!targetHex || !targetHex.occupied || !targetHex.occupiedBy) {
            return { valid: false, reason: "Target not found" };
        }

        const attacker = attackerHex.occupiedBy;
        const target = targetHex.occupiedBy;

        // Check if attacker is tapped
        if (attacker.isTapped) {
            return { valid: false, reason: "Attacker is tapped" };
        }

        // Check range
        const distance = this.getHexDistance(attackerRow, attackerCol, targetRow, targetCol);
        
        if (attacker.ranged_damage > 0) {
            // Ranged attack
            if (distance > attacker.range) {
                return { valid: false, reason: "Target out of range" };
            }
        } else {
            // Melee attack
            if (distance > 1) {
                return { valid: false, reason: "Target not adjacent" };
            }
        }

        return { valid: true };
    }
}
