import { BaseGameAction } from "./GameAction";
import { Card } from "../../entities/Card";

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
        // Check if attacker hex exists and is occupied
        if (!state.hexMap || !state.hexMap[this.attackerRow] || !state.hexMap[this.attackerRow][this.attackerCol]) {
            return false;
        }

        const attackerHex = state.hexMap[this.attackerRow][this.attackerCol];
        if (!attackerHex.occupied || !attackerHex.occupiedBy) {
            return false;
        }

        // Check if player owns the attacker
        if (attackerHex.occupiedByPlayerId !== this.playerId) {
            return false;
        }

        // Check if target hex exists and is occupied
        if (!state.hexMap[this.targetRow] || !state.hexMap[this.targetRow][this.targetCol]) {
            return false;
        }

        const targetHex = state.hexMap[this.targetRow][this.targetCol];
        if (!targetHex.occupied || !targetHex.occupiedBy) {
            return false;
        }

        // Check if it's player's turn
        if (state.currentPlayerId !== this.playerId) {
            return false;
        }

        // Check if attacker is tapped (can't attack if already tapped)
        const attacker = attackerHex.occupiedBy;
        if (attacker.isTapped) {
            return false;
        }

        // Check attack range using GameRules
        const { GameRules } = require("../rules/GameRules");
        const canAttack = GameRules.canAttack(state, this.attackerRow, this.attackerCol, this.targetRow, this.targetCol);
        
        return canAttack.valid;
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
            // Use ranged damage if available
            const distance = require("../rules/GameRules").GameRules.getHexDistance(
                this.attackerRow, this.attackerCol, this.targetRow, this.targetCol
            );
            if (distance <= attacker.range) {
                damage = attacker.ranged_damage;
            }
        }

        // Apply damage to target
        // Initialize currentHP if not set
        if (target.currentHP === undefined) {
            target.currentHP = target.hp;
        }
        target.currentHP -= damage;

        // If target is destroyed, remove it
        if (target.currentHP <= 0) {
            targetHex.occupied = false;
            targetHex.occupiedBy = null;
            targetHex.occupiedByPlayerId = null;
            
            // Emit card destroyed event
            require("../events/GameEvents").GameEventEmitter.emit(
                require("../events/GameEvents").GameEventType.CARD_DESTROYED,
                { row: this.targetRow, col: this.targetCol }
            );
        } else {
            // Update target card
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
