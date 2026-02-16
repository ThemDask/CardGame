import { BaseGameAction } from "./GameAction";
import { GameRules } from "../rules/GameRules";

export interface PlaceCardActionData {
    cardId: string;
    hexRow: number;
    hexCol: number;
}

/**
 * Action to place a card on a hex tile
 */
export class PlaceCardAction extends BaseGameAction {
    public readonly cardId: string;
    public readonly hexRow: number;
    public readonly hexCol: number;

    constructor(playerId: string, cardId: string, hexRow: number, hexCol: number) {
        super("PLACE_CARD", playerId);
        this.cardId = cardId;
        this.hexRow = hexRow;
        this.hexCol = hexCol;
    }

    serialize(): PlaceCardActionData {
        return {
            cardId: this.cardId,
            hexRow: this.hexRow,
            hexCol: this.hexCol
        };
    }

    static deserialize(playerId: string, data: PlaceCardActionData, timestamp?: number): PlaceCardAction {
        const action = new PlaceCardAction(playerId, data.cardId, data.hexRow, data.hexCol);
        if (timestamp) {
            (action as any).timestamp = timestamp;
        }
        return action;
    }

    validate(state: any): boolean {
        return GameRules.canPlaceCard(state, this.playerId, this.cardId, this.hexRow, this.hexCol).valid;
    }

    apply(state: any): any {
        if (!this.validate(state)) {
            throw new Error(`Invalid PlaceCardAction: ${JSON.stringify(this.serialize())}`);
        }

        // Create new state (immutable update)
        // Note: We need to preserve Player and Card instances, so we'll do a shallow clone
        // and only clone what we modify
        const newState = {
            ...state,
            players: { ...state.players },
            hexMap: state.hexMap.map((row: any[]) => [...row])
        };
        
        // Clone the player we're modifying
        const playerData = state.players[this.playerId];
        const newPlayer = {
            ...playerData,
            deck: [...playerData.deck]
        };
        newState.players[this.playerId] = newPlayer;
        
        const cardIndex = newPlayer.deck.findIndex((c: any) => c.id === this.cardId);
        const card = newPlayer.deck[cardIndex];
        
        // Remove card from player's deck
        newPlayer.deck.splice(cardIndex, 1);
        
        // Deduct gold
        newPlayer.availableGold -= card.cost;
        
        // Clone the hex we're modifying
        const hexRow = [...newState.hexMap[this.hexRow]];
        const hex = { ...hexRow[this.hexCol] };
        hex.occupied = true;
        hex.occupiedBy = card;
        hex.occupiedByPlayerId = this.playerId;
        hexRow[this.hexCol] = hex;
        newState.hexMap[this.hexRow] = hexRow;

        return newState;
    }
}
