import { BaseGameAction } from "./GameAction";

/**
 * Action to end a player's turn
 */
export class EndTurnAction extends BaseGameAction {
    constructor(playerId: string) {
        super("END_TURN", playerId);
    }

    serialize(): any {
        return {};
    }

    static deserialize(playerId: string, timestamp?: number): EndTurnAction {
        const action = new EndTurnAction(playerId);
        if (timestamp) {
            (action as any).timestamp = timestamp;
        }
        return action;
    }

    validate(state: any): boolean {
        // Check if it's this player's turn
        return state.currentPlayerId === this.playerId;
    }

    apply(state: any): any {
        if (!this.validate(state)) {
            throw new Error(`Invalid EndTurnAction: Not player ${this.playerId}'s turn`);
        }

        // Shallow clone to preserve object references
        const newState = {
            ...state,
            players: { ...state.players }
        };
        
        // Switch to next player
        const playerIds = Object.keys(newState.players);
        const currentIndex = playerIds.indexOf(this.playerId);
        const nextIndex = (currentIndex + 1) % playerIds.length;
        const nextPlayerId = playerIds[nextIndex];
        
        newState.currentPlayerId = nextPlayerId;
        newState.turnCounter += 1;

        // Note: Card untapping happens in GameStateManager after state update
        // This allows the event system to know which player's cards to untap

        return newState;
    }
}
