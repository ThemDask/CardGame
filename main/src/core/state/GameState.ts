import { Card } from "../../entities/Card";
import { Player } from "../../entities/Player";
import { HexData, hexToData } from "./HexData";
import { Hex } from "../../entities/Hex";

/**
 * Pure game state - no UI concerns, fully serializable
 * This is the authoritative game state that can be synced across clients
 * Note: No Phaser objects here - only data
 */
export interface GameState {
    // Players
    players: Record<string, Player>;
    currentPlayerId: string;
    
    // Board state (using HexData instead of Hex to avoid Phaser objects)
    hexMap: HexData[][];
    
    // Game flow
    turnCounter: number;
    gamePhase: GamePhase;
    
    // Metadata
    gameId?: string;
    createdAt?: number;
    lastUpdated?: number;
}

export enum GamePhase {
    DEPLOYMENT = 'deployment',
    MAIN = 'main',
    COMBAT = 'combat',
    END = 'end'
}

/**
 * Helper functions for GameState
 */
export class GameStateHelper {
    /**
     * Create initial game state
     */
    static createInitialState(
        player1: Player,
        player2: Player,
        hexMap: Hex[][]
    ): GameState {
        // Convert Hex[][] to HexData[][]
        const hexDataMap: HexData[][] = hexMap.map(row => 
            row.map(hex => hexToData(hex))
        );
        
        return {
            players: {
                [player1.name]: player1,
                [player2.name]: player2
            },
            currentPlayerId: player1.name,
            hexMap: hexDataMap,
            turnCounter: 1,
            gamePhase: GamePhase.DEPLOYMENT,
            createdAt: Date.now(),
            lastUpdated: Date.now()
        };
    }

    /**
     * Get current player
     */
    static getCurrentPlayer(state: GameState): Player {
        return state.players[state.currentPlayerId];
    }

    /**
     * Get opponent player
     */
    static getOpponent(state: GameState, playerId: string): Player | null {
        const playerIds = Object.keys(state.players);
        const opponentId = playerIds.find(id => id !== playerId);
        return opponentId ? state.players[opponentId] : null;
    }

    /**
     * Check if it's a specific player's turn
     */
    static isPlayerTurn(state: GameState, playerId: string): boolean {
        return state.currentPlayerId === playerId;
    }

    /**
     * Serialize state for network transmission
     */
    static serialize(state: GameState): string {
        return JSON.stringify(state);
    }

    /**
     * Deserialize state from network
     */
    static deserialize(json: string): GameState {
        return JSON.parse(json);
    }

    /**
     * Create a shallow copy of state (preserves object references)
     * Note: Actions should do their own cloning of modified parts
     */
    static clone(state: GameState): GameState {
        // Shallow clone to preserve Player and Card instances
        return {
            ...state,
            players: { ...state.players },
            hexMap: state.hexMap.map(row => [...row])
        };
    }
}
