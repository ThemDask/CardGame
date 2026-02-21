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

        const playerIds = Object.keys(state.players);
        const currentIndex = playerIds.indexOf(this.playerId);
        const nextIndex = (currentIndex + 1) % playerIds.length;
        const nextPlayerId = playerIds[nextIndex];

        const newState = {
            ...state,
            players: { ...state.players },
            currentPlayerId: nextPlayerId,
            turnCounter: state.turnCounter + 1,
            hexMap: state.hexMap.map((row: any[], rowIndex: number) =>
                row.map((hex: any, colIndex: number) => {
                    if (!hex.occupied || !hex.occupiedBy || hex.occupiedByPlayerId !== nextPlayerId) {
                        return hex;
                    }
                    return {
                        ...hex,
                        occupiedBy: {
                            ...hex.occupiedBy,
                            isTapped: false,
                            remainingActions: hex.occupiedBy.actions ?? 0
                        }
                    };
                })
            )
        };

        return newState;
    }
}
