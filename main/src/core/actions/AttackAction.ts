import { BaseGameAction } from "./GameAction";
import { GameRules } from "../rules/GameRules";

export interface AttackActionData {
    attackerRow: number;
    attackerCol: number;
    targetRow: number;
    targetCol: number;
}

/**
 * Action to attack with a card
 */
export class AttackAction extends BaseGameAction {
    public readonly attackerRow: number;
    public readonly attackerCol: number;
    public readonly targetRow: number;
    public readonly targetCol: number;

    constructor(playerId: string, attackerRow: number, attackerCol: number, targetRow: number, targetCol: number) {
        super("ATTACK", playerId);
        this.attackerRow = attackerRow;
        this.attackerCol = attackerCol;
        this.targetRow = targetRow;
        this.targetCol = targetCol;
    }

    serialize(): AttackActionData {
        return {
            attackerRow: this.attackerRow,
            attackerCol: this.attackerCol,
            targetRow: this.targetRow,
            targetCol: this.targetCol
        };
    }

    static deserialize(playerId: string, data: AttackActionData, timestamp?: number): AttackAction {
        const action = new AttackAction(playerId, data.attackerRow, data.attackerCol, data.targetRow, data.targetCol);
        if (timestamp) {
            (action as any).timestamp = timestamp;
        }
        return action;
    }

    validate(state: any): boolean {
        return GameRules.canAttack(state, this.playerId, this.attackerRow, this.attackerCol, this.targetRow, this.targetCol).valid;
    }

    apply(state: any): any {
        if (!this.validate(state)) {
            throw new Error(`Invalid AttackAction: ${JSON.stringify(this.serialize())}`);
        }

        // Shallow clone to preserve object references
        const newState = {
            ...state,
            hexMap: state.hexMap.map((row: any[]) => [...row])
        };
        
        // Clone the hex rows we're modifying
        const attackerHexRow = [...newState.hexMap[this.attackerRow]];
        const targetHexRow = [...newState.hexMap[this.targetRow]];
        
        const attackerHex = { ...attackerHexRow[this.attackerCol] };
        const targetHex = { ...targetHexRow[this.targetCol] };
        const attacker = { ...attackerHex.occupiedBy };
        const target = { ...targetHex.occupiedBy };

        // Calculate damage
        let damage = attacker.damage;
        if (attacker.ranged_damage > 0) {
            const distance = GameRules.getHexDistance(
                this.attackerRow, this.attackerCol, this.targetRow, this.targetCol
            );
            if (distance <= attacker.range) {
                damage = attacker.ranged_damage;
            }
        }

        // Apply damage to target
        if (target.currentHP === undefined) {
            target.currentHP = target.hp;
        }
        target.currentHP -= damage;

        if (target.currentHP <= 0) {
            targetHex.occupied = false;
            targetHex.occupiedBy = null;
            targetHex.occupiedByPlayerId = null;
        } else {
            targetHex.occupiedBy = target;
        }

        // Tap the attacker (can't attack again this turn)
        attacker.isTapped = true;
        attackerHex.occupiedBy = attacker;
        
        // Update hex rows
        attackerHexRow[this.attackerCol] = attackerHex;
        targetHexRow[this.targetCol] = targetHex;
        newState.hexMap[this.attackerRow] = attackerHexRow;
        newState.hexMap[this.targetRow] = targetHexRow;

        return newState;
    }
}
