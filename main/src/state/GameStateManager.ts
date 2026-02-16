import { Card } from "../entities/Card";
import { Hex } from "../entities/Hex";
import { Player } from "../entities/Player";
import { GameState, GameStateHelper, GamePhase } from "../core/state/GameState";
import { UIManager } from "../core/state/UIManager";
import { GameAction } from "../core/actions/GameAction";
import { PlaceCardAction } from "../core/actions/PlaceCardAction";
import { MoveCardAction } from "../core/actions/MoveCardAction";
import { AttackAction } from "../core/actions/AttackAction";
import { EndTurnAction } from "../core/actions/EndTurnAction";
import { GameEventEmitter, GameEventType, StateChangedEvent, ActionExecutedEvent, ActionRejectedEvent, CardPlacedEvent, TurnEndedEvent } from "../core/events/GameEvents";

/**
 * Refactored GameStateManager
 * - Manages authoritative game state
 * - Processes actions through action system
 * - Emits events for UI updates
 * - Ready for multiplayer (actions are serializable)
 */
export class GameStateManager {
    private static instance: GameStateManager;
    
    private gameState: GameState | null = null;
    private uiManager: UIManager;
    private actionHistory: GameAction[] = [];

    private constructor() {
        this.uiManager = UIManager.getInstance();
    }

    public static getInstance(): GameStateManager {
        if (!GameStateManager.instance) {
            GameStateManager.instance = new GameStateManager();
        }
        return GameStateManager.instance;
    }

    /**
     * Initialize game state (called when starting a new game)
     */
    public initializeGame(player1: Player, player2: Player, hexMap: Hex[][]): void {
        this.gameState = GameStateHelper.createInitialState(player1, player2, hexMap);
        this.actionHistory = [];
        
        GameEventEmitter.emit(GameEventType.GAME_STARTED, {
            state: this.gameState
        });
    }

    /**
     * Get current game state (read-only)
     */
    public getGameState(): GameState | null {
        return this.gameState;
    }

    /**
     * Execute a game action
     * This is the main entry point for all game actions
     */
    public executeAction(action: GameAction): boolean {
        if (!this.gameState) {
            this.rejectAction(action, "Game not initialized");
            return false;
        }

        // Validate action
        if (!action.validate(this.gameState)) {
            this.rejectAction(action, "Action validation failed");
            return false;
        }

        // Apply action to state
        try {
            const previousState = GameStateHelper.clone(this.gameState);
            this.gameState = action.apply(this.gameState);
            this.gameState.lastUpdated = Date.now();
            
            // Add to history
            this.actionHistory.push(action);

            // Emit specific events based on action type
            this.emitActionSpecificEvents(action, previousState);

            // Emit general events
            this.emitStateChanged(previousState, this.gameState, action);
            this.emitActionExecuted(action, true);

            return true;
        } catch (error) {
            this.rejectAction(action, error instanceof Error ? error.message : "Unknown error");
            return false;
        }
    }

    /**
     * Emit action-specific events
     */
    private emitActionSpecificEvents(action: GameAction, previousState: GameState): void {
        if (action instanceof PlaceCardAction) {
            const event: CardPlacedEvent = {
                cardId: action.cardId,
                hexRow: action.hexRow,
                hexCol: action.hexCol,
                playerId: action.playerId
            };
            GameEventEmitter.emit(GameEventType.CARD_PLACED, event);
        } else if (action instanceof MoveCardAction) {
            GameEventEmitter.emit(GameEventType.CARD_MOVED, {
                fromRow: action.fromRow,
                fromCol: action.fromCol,
                toRow: action.toRow,
                toCol: action.toCol,
                playerId: action.playerId
            });
        } else if (action instanceof AttackAction) {
            GameEventEmitter.emit(GameEventType.CARD_ATTACKED, {
                attackerRow: action.attackerRow,
                attackerCol: action.attackerCol,
                targetRow: action.targetRow,
                targetCol: action.targetCol,
                playerId: action.playerId
            });
            const targetHexAfter = this.gameState!.hexMap[action.targetRow]?.[action.targetCol];
            if (targetHexAfter && !targetHexAfter.occupied) {
                GameEventEmitter.emit(GameEventType.CARD_DESTROYED, { row: action.targetRow, col: action.targetCol });
            }
        } else if (action instanceof EndTurnAction) {
            const previousPlayerId = previousState.currentPlayerId;
            const newPlayerId = this.gameState!.currentPlayerId;
            const event: TurnEndedEvent = {
                previousPlayerId,
                newPlayerId,
                turnCounter: this.gameState!.turnCounter
            };
            GameEventEmitter.emit(GameEventType.TURN_ENDED, event);
            GameEventEmitter.emit(GameEventType.TURN_STARTED, { playerId: newPlayerId });
        }
    }

    /**
     * Replay actions (for multiplayer sync or undo/redo)
     */
    public replayActions(actions: GameAction[]): void {
        if (!this.gameState) {
            throw new Error("Cannot replay actions: Game not initialized");
        }

        for (const action of actions) {
            if (!action.validate(this.gameState)) {
                console.warn(`Skipping invalid action during replay: ${action.type}`);
                continue;
            }

            this.gameState = action.apply(this.gameState);
            this.gameState.lastUpdated = Date.now();
            this.actionHistory.push(action);
        }

        GameEventEmitter.emit(GameEventType.STATE_CHANGED, {
            previousState: null,
            newState: this.gameState,
            action: null
        });
    }

    /**
     * Get action history (for debugging/replay)
     */
    public getActionHistory(): readonly GameAction[] {
        return [...this.actionHistory];
    }

    /**
     * Legacy methods for backward compatibility
     * These delegate to UI Manager or Game State
     */
    
    /**
     * Reconstruct Player object from plain data (after JSON serialization)
     */
    private reconstructPlayer(playerData: any): Player {
        if (playerData instanceof Player) {
            return playerData; // Already a Player instance
        }
        
        // Reconstruct Player from plain object
        const player = new Player(
            playerData.name,
            this.reconstructCards(playerData.deck || []),
            playerData.time ?? 300,
            playerData.seconds ?? 300,
            playerData.availableGold ?? 100
        );
        return player;
    }

    /**
     * Reconstruct Card objects from plain data
     */
    private reconstructCards(cardsData: any[]): Card[] {
        return cardsData.map(cardData => {
            if (cardData instanceof Card) {
                return cardData; // Already a Card instance
            }
            
            // Reconstruct Card from plain object
            return new Card(
                cardData.id,
                cardData.type,
                cardData.name,
                cardData.movement ?? 0,
                cardData.damage ?? 0,
                cardData.ranged_damage ?? 0,
                cardData.range ?? 0,
                cardData.hp ?? 0,
                cardData.cost ?? 0,
                cardData.description ?? "",
                cardData.imagePath,
                cardData.keywords || []
            );
        });
    }

    // Player management
    public setPlayer1(player: Player): void {
        if (!this.gameState) {
            throw new Error("Game not initialized. Call initializeGame() first.");
        }
        this.gameState.players[player.name] = player;
        this.gameState.lastUpdated = Date.now();
        this.emitStateChanged(this.gameState, this.gameState, null);
    }

    public getPlayer1(): Player | null {
        if (!this.gameState) return null;
        const playerIds = Object.keys(this.gameState.players);
        if (playerIds.length === 0) return null;
        
        const playerData = this.gameState.players[playerIds[0]];
        return this.reconstructPlayer(playerData);
    }

    public setPlayer2(player: Player): void {
        if (!this.gameState) {
            throw new Error("Game not initialized. Call initializeGame() first.");
        }
        this.gameState.players[player.name] = player;
        this.gameState.lastUpdated = Date.now();
        this.emitStateChanged(this.gameState, this.gameState, null);
    }

    public getPlayer2(): Player | null {
        if (!this.gameState) return null;
        const playerIds = Object.keys(this.gameState.players);
        if (playerIds.length < 2) return null;
        
        const playerData = this.gameState.players[playerIds[1]];
        return this.reconstructPlayer(playerData);
    }

    public getTurnCounter(): number {
        return this.gameState?.turnCounter ?? 1;
    }

    public incrementTurn(): void {
        if (!this.gameState) return;
        this.gameState.turnCounter += 1;
        this.gameState.lastUpdated = Date.now();
        this.emitStateChanged(this.gameState, this.gameState, null);
    }

    // UI state (delegated to UIManager)
    public setSelectedCard(card: Card | null): void {
        this.uiManager.setSelectedCard(card);
    }

    public getSelectedCard(): Card | null {
        return this.uiManager.getSelectedCard();
    }

    public setSelectedHex(hex: Hex | null): void {
        this.uiManager.setSelectedHex(hex);
    }

    public getSelectedHex(): Hex | null {
        return this.uiManager.getSelectedHex();
    }

    public clearSelections(): void {
        this.uiManager.clearAllSelections();
    }

    public setSelectedDeck(deck: string[]): void {
        this.uiManager.setSelectedDeck(deck);
    }

    public getSelectedDeck(): string[] | null {
        return this.uiManager.getSelectedDeck();
    }

    // Event emission helpers
    private emitStateChanged(previousState: GameState, newState: GameState, action: GameAction | null): void {
        const event: StateChangedEvent = {
            previousState,
            newState,
            action
        };
        GameEventEmitter.emit(GameEventType.STATE_CHANGED, event);
    }

    private emitActionExecuted(action: GameAction, success: boolean): void {
        const event: ActionExecutedEvent = {
            action,
            success
        };
        GameEventEmitter.emit(GameEventType.ACTION_EXECUTED, event);
    }

    private rejectAction(action: GameAction, reason: string): void {
        const event: ActionRejectedEvent = {
            action,
            reason
        };
        GameEventEmitter.emit(GameEventType.ACTION_REJECTED, event);
    }
}
