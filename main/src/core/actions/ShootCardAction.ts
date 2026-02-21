import { BaseGameAction } from "./GameAction";
import { GameRules } from "../rules/GameRules";

export interface ShootCardActionData {
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
}

/**
 * Action to shoot at an enemy card from range.
 * Attacker stays in place; defender takes ranged_damage.
 * If defender dies, the hex is cleared. Costs 1 action point.
 */
export class ShootCardAction extends BaseGameAction {
    public readonly fromRow: number;
    public readonly fromCol: number;
    public readonly toRow: number;
    public readonly toCol: number;

    public defenderKilled: boolean = false;
    public damageDealt: number = 0;
    public attackerCardId: string = '';
    public defenderCardId: string = '';

    constructor(playerId: string, fromRow: number, fromCol: number, toRow: number, toCol: number) {
        super("SHOOT_CARD", playerId);
        this.fromRow = fromRow;
        this.fromCol = fromCol;
        this.toRow = toRow;
        this.toCol = toCol;
    }

    serialize(): ShootCardActionData {
        return {
            fromRow: this.fromRow,
            fromCol: this.fromCol,
            toRow: this.toRow,
            toCol: this.toCol
        };
    }

    static deserialize(playerId: string, data: ShootCardActionData, timestamp?: number): ShootCardAction {
        const action = new ShootCardAction(playerId, data.fromRow, data.fromCol, data.toRow, data.toCol);
        if (timestamp) {
            (action as any).timestamp = timestamp;
        }
        return action;
    }

    validate(state: any): boolean {
        return GameRules.canShootCard(state, this.playerId, this.fromRow, this.fromCol, this.toRow, this.toCol).valid;
    }

    apply(state: any): any {
        if (!this.validate(state)) {
            throw new Error(`Invalid ShootCardAction: ${JSON.stringify(this.serialize())}`);
        }

        const newState = {
            ...state,
            players: { ...state.players },
            hexMap: state.hexMap.map((row: any[]) => [...row])
        };

        const sourceRow = [...newState.hexMap[this.fromRow]];
        const sourceHex = { ...sourceRow[this.fromCol] };
        const card = { ...sourceHex.occupiedBy };
        this.attackerCardId = card.id;

        const targetRow = [...newState.hexMap[this.toRow]];
        const targetHex = { ...targetRow[this.toCol] };
        const defender = { ...targetHex.occupiedBy };
        this.defenderCardId = defender.id;

        card.remainingActions = (card.remainingActions ?? card.actions) - 1;
        this.damageDealt = card.ranged_damage ?? 0;
        defender.currentHP = (defender.currentHP ?? defender.hp) - this.damageDealt;

        sourceHex.occupiedBy = card;

        if (defender.currentHP <= 0) {
            this.defenderKilled = true;
            targetHex.occupied = false;
            targetHex.occupiedBy = null;
            targetHex.occupiedByPlayerId = null;
        } else {
            // Defender survives
            targetHex.occupiedBy = defender;
        }

        sourceRow[this.fromCol] = sourceHex;
        targetRow[this.toCol] = targetHex;
        newState.hexMap[this.fromRow] = sourceRow;
        newState.hexMap[this.toRow] = targetRow;

        return newState;
    }
}
