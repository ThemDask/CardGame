/**
 * Base interface for all game actions.
 * Actions must be serializable for multiplayer support.
 */
export interface GameAction {
    /** Unique action type identifier */
    type: string;
    
    /** ID of the player performing the action */
    playerId: string;
    
    /** Timestamp when action was created (for ordering/replay) */
    timestamp: number;
    
    /** Serialize action to JSON for network transmission */
    serialize(): any;
    
    /** Validate if action can be applied to current game state */
    validate(state: any): boolean;
    
    /** Apply action to game state (pure function, returns new state) */
    apply(state: any): any;
}

/**
 * Base class for game actions with common functionality
 */
export abstract class BaseGameAction implements GameAction {
    public readonly type: string;
    public readonly playerId: string;
    public readonly timestamp: number;

    constructor(type: string, playerId: string) {
        this.type = type;
        this.playerId = playerId;
        this.timestamp = Date.now();
    }

    abstract serialize(): any;
    abstract validate(state: any): boolean;
    abstract apply(state: any): any;
}
