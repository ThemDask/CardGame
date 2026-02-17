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
