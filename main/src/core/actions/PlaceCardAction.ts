import { BaseGameAction } from "./GameAction";
import { Card } from "../../entities/Card";

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
        // Check if hex exists and is not occupied
        if (!state.hexMap || !state.hexMap[this.hexRow] || !state.hexMap[this.hexRow][this.hexCol]) {
            return false;
        }

        const hex = state.hexMap[this.hexRow][this.hexCol];
        if (hex.occupied) {
            return false;
        }

        // Check if player owns the card
        const player = state.players[this.playerId];
        if (!player) {
            return false;
        }

        const card = player.deck.find((c: Card) => c.id === this.cardId);
        if (!card) {
            return false;
        }

        // Check if player has enough gold
        if (player.availableGold < card.cost) {
            return false;
        }

        // Check deployment restrictions: can only deploy on deploy-type hexes
        // After deployment phase, cards can move freely, but initial placement requires deploy hexes
        const hexType = hex.type;
        const isDeploymentPhase = state.gamePhase === 'deployment';
        
        if (isDeploymentPhase) {
            // During deployment, only allow placement on deploy hexes
            if (hexType !== 'landDeploy' && hexType !== 'waterDeploy') {
                return false;
            }
            
            // Check if marine units can only be placed on water
            if (card.keywords && card.keywords.some((kw: string) => kw.includes('Marine'))) {
                if (hexType !== 'waterDeploy') {
                    return false;
                }
            }
        }
        // After deployment phase, cards can be placed anywhere (via movement, not initial placement)
        // But this action is for initial placement, so we keep the restriction

        return true;
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
