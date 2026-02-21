import { BaseGameAction } from "./GameAction";
import { GameRules } from "../rules/GameRules";

export interface MoveCardActionData {
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
}

/**
 * Action to move a card from one hex to another.
 * If the target hex is empty, this is a pure movement.
 * If the target hex has an enemy card, this is a melee attack:
 *   - Attacker deals its `damage` to defender's `currentHP`
 *   - If defender dies: attacker moves into the hex
 *   - If defender survives: attacker stays in place
 * Each move/attack costs 1 action point from the card's remainingActions.
 */
export class MoveCardAction extends BaseGameAction {
    public readonly fromRow: number;
    public readonly fromCol: number;
    public readonly toRow: number;
    public readonly toCol: number;

    // Populated after apply() for event emission
    public isAttack: boolean = false;
    public defenderKilled: boolean = false;
    public damageDealt: number = 0;
    public attackerCardId: string = '';
    public defenderCardId: string = '';

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
        return GameRules.canMoveCard(state, this.playerId, this.fromRow, this.fromCol, this.toRow, this.toCol).valid;
    }

    apply(state: any): any {
        if (!this.validate(state)) {
            throw new Error(`Invalid MoveCardAction: ${JSON.stringify(this.serialize())}`);
        }

        // Clone state immutably
        const newState = {
            ...state,
            players: { ...state.players },
            hexMap: state.hexMap.map((row: any[]) => [...row])
        };

        // Clone source hex
        const sourceRow = [...newState.hexMap[this.fromRow]];
        const sourceHex = { ...sourceRow[this.fromCol] };
        const card = { ...sourceHex.occupiedBy };
        this.attackerCardId = card.id;

        // Clone target hex
        const targetRow = this.fromRow === this.toRow ? sourceRow : [...newState.hexMap[this.toRow]];
        const targetHex = { ...targetRow[this.toCol] };

        // Decrement remaining actions
        card.remainingActions = (card.remainingActions ?? card.actions) - 1;

        if (targetHex.occupied && targetHex.occupiedBy && targetHex.occupiedByPlayerId !== this.playerId) {
            // MELEE ATTACK
            this.isAttack = true;
            const defender = { ...targetHex.occupiedBy };
            this.defenderCardId = defender.id;
            this.damageDealt = card.damage;

            defender.currentHP = (defender.currentHP ?? defender.hp) - card.damage;

            if (defender.currentHP <= 0) {
                // Defender killed: attacker moves into target hex
                this.defenderKilled = true;

                // Clear source hex
                sourceHex.occupied = false;
                sourceHex.occupiedBy = null;
                sourceHex.occupiedByPlayerId = null;

                // Move attacker into target hex
                targetHex.occupied = true;
                targetHex.occupiedBy = card;
                targetHex.occupiedByPlayerId = this.playerId;
            } else {
                // Defender survives: attacker stays in place, update defender HP
                this.defenderKilled = false;

                // Update card in source hex (actions decremented)
                sourceHex.occupiedBy = card;

                // Update defender in target hex
                targetHex.occupiedBy = defender;
            }
        } else {
            // PURE MOVEMENT to empty hex
            this.isAttack = false;

            // Clear source hex
            sourceHex.occupied = false;
            sourceHex.occupiedBy = null;
            sourceHex.occupiedByPlayerId = null;

            // Place card in target hex
            targetHex.occupied = true;
            targetHex.occupiedBy = card;
            targetHex.occupiedByPlayerId = this.playerId;
        }

        // Write back modified hexes
        sourceRow[this.fromCol] = sourceHex;
        newState.hexMap[this.fromRow] = sourceRow;

        if (this.fromRow !== this.toRow) {
            targetRow[this.toCol] = targetHex;
            newState.hexMap[this.toRow] = targetRow;
        } else {
            // Same row - targetRow IS sourceRow, already updated
            sourceRow[this.toCol] = targetHex;
        }

        return newState;
    }
}
