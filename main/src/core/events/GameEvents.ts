import Phaser from 'phaser';
import { GameAction } from '../actions/GameAction';

/**
 * Event names for game state changes
 */
export enum GameEventType {
    // State changes
    STATE_CHANGED = 'state_changed',
    CARD_PLACED = 'card_placed',
    CARD_MOVED = 'card_moved',
    CARD_ATTACKED = 'card_attacked',
    CARD_DESTROYED = 'card_destroyed',
    TURN_ENDED = 'turn_ended',
    TURN_STARTED = 'turn_started',
    PLAYER_CHANGED = 'player_changed',
    
    // Player actions
    ACTION_EXECUTED = 'action_executed',
    ACTION_REJECTED = 'action_rejected',
    
    // Game flow
    GAME_STARTED = 'game_started',
    GAME_ENDED = 'game_ended',
    PHASE_CHANGED = 'phase_changed',

    // UI
    CARD_HOVER = 'card_hover',
}

/**
 * Event data structures
 */
export interface StateChangedEvent {
    previousState: any;
    newState: any;
    action: GameAction | null;
}

export interface CardPlacedEvent {
    cardId: string;
    hexRow: number;
    hexCol: number;
    playerId: string;
}

export interface TurnEndedEvent {
    previousPlayerId: string;
    newPlayerId: string;
    turnCounter: number;
}

export interface CardMovedEvent {
    cardId: string;
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
    playerId: string;
}

export interface CardAttackedEvent {
    attackerCardId: string;
    defenderCardId: string;
    damage: number;
    defenderKilled: boolean;
    fromRow: number;
    fromCol: number;
    toRow: number;
    toCol: number;
}

export interface ActionExecutedEvent {
    action: GameAction;
    success: boolean;
}

export interface ActionRejectedEvent {
    action: GameAction;
    reason: string;
}

/**
 * Global event emitter for game events
 * Uses Phaser's event system for consistency
 */
export class GameEventEmitter {
    private static instance: Phaser.Events.EventEmitter | null = null;

    static getInstance(): Phaser.Events.EventEmitter {
        if (!GameEventEmitter.instance) {
            GameEventEmitter.instance = new Phaser.Events.EventEmitter();
        }
        return GameEventEmitter.instance;
    }

    static emit(event: GameEventType, data?: any): void {
        GameEventEmitter.getInstance().emit(event, data);
    }

    static on(event: GameEventType, callback: Function, context?: any): void {
        GameEventEmitter.getInstance().on(event, callback, context);
    }

    static off(event: GameEventType, callback?: Function, context?: any): void {
        GameEventEmitter.getInstance().off(event, callback, context);
    }

    static once(event: GameEventType, callback: Function, context?: any): void {
        GameEventEmitter.getInstance().once(event, callback, context);
    }
}
