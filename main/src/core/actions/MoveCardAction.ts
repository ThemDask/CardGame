import { BaseGameAction } from "./GameAction";

export interface MoveCardActionData {
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
}

/**
 * Action to move a card from one hex to another
 */
export class MoveCardAction extends BaseGameAction {
    public readonly fromRow: number;
    public readonly fromCol: number;
    public readonly toRow: number;
    public readonly toCol: number;

    constructor(playerId: string, fromRow: number, fromCol: number, toRow: number, toCol: number) {
        super("MOVE_CARD", playerId);
        this.fromRow = fromRow;
        this.fromCol = fromCol;
        this.toRow = toRow;
        this.toCol = toCol;
    }

    serialize(): MoveCardActionData {
        return {
            fromRow: this.fromRow,
            fromCol: this.fromCol,
            toRow: this.toRow,
            toCol: this.toCol
        };
    }

    static deserialize(playerId: string, data: MoveCardActionData, timestamp?: number): MoveCardAction {
        const action = new MoveCardAction(playerId, data.fromRow, data.fromCol, data.toRow, data.toCol);
        if (timestamp) {
            (action as any).timestamp = timestamp;
        }
        return action;
    }

    validate(state: any): boolean {
        // Check if source hex exists and is occupied by this player
        if (!state.hexMap || !state.hexMap[this.fromRow] || !state.hexMap[this.fromRow][this.fromCol]) {
            return false;
        }

        const fromHex = state.hexMap[this.fromRow][this.fromCol];
        if (!fromHex.occupied || !fromHex.occupiedBy) {
            return false;
        }

        // Check if player owns the card
        if (fromHex.occupiedByPlayerId !== this.playerId) {
            return false;
        }

        // Check if destination hex exists and is not occupied
        if (!state.hexMap[this.toRow] || !state.hexMap[this.toRow][this.toCol]) {
            return false;
        }

        const toHex = state.hexMap[this.toRow][this.toCol];
        if (toHex.occupied) {
            return false;
        }

        // Check if it's player's turn
        if (state.currentPlayerId !== this.playerId) {
            return false;
        }

        // Check if card is tapped (can't move if tapped)
        const card = fromHex.occupiedBy;
        if (card.isTapped) {
            return false;
        }

        // Check movement range (using GameRules)
        const { GameRules } = require("../rules/GameRules");
        const distance = GameRules.getHexDistance(this.fromRow, this.fromCol, this.toRow, this.toCol);
        
        if (distance > card.movement) {
            return false;
        }

        // After deployment phase, cards can move more freely
        // (no hex type restrictions for movement)
        return true;
    }

    apply(state: any): any {
        if (!this.validate(state)) {
            throw new Error(`Invalid MoveCardAction: ${JSON.stringify(this.serialize())}`);
        }

        // Shallow clone to preserve object references
        const newState = {
            ...state,
            hexMap: state.hexMap.map((row: any[]) => [...row])
        };
        
        // Clone the hex rows we're modifying
        const fromHexRow = [...newState.hexMap[this.fromRow]];
        const toHexRow = [...newState.hexMap[this.toRow]];
        
        const fromHex = { ...fromHexRow[this.fromCol] };
        const toHex = { ...toHexRow[this.toCol] };
        const card = fromHex.occupiedBy;

        // Move card from source to destination
        toHex.occupied = true;
        toHex.occupiedBy = card;
        toHex.occupiedByPlayerId = this.playerId;

        // Clear source hex
        fromHex.occupied = false;
        fromHex.occupiedBy = null;
        fromHex.occupiedByPlayerId = null;
        
        // Update hex rows
        fromHexRow[this.fromCol] = fromHex;
        toHexRow[this.toCol] = toHex;
        newState.hexMap[this.fromRow] = fromHexRow;
        newState.hexMap[this.toRow] = toHexRow;

        return newState;
    }
}
