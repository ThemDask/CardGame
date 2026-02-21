# Multiplayer-Compatible Architecture Refactor

## Overview
This refactor transforms the codebase from a single-player architecture with direct state mutations to a multiplayer-ready architecture using actions, events, and serializable state.

## Key Architectural Changes

### 1. Action System (`main/src/core/actions/`)
**Purpose**: All game actions are now serializable and can be sent over the network.

- **`GameAction.ts`**: Base interface for all actions
- **`PlaceCardAction.ts`**: Action for placing cards on hexes
- **`EndTurnAction.ts`**: Action for ending turns

**Benefits**:
- Actions can be serialized and sent to server/other clients
- Actions can be validated before execution
- Actions can be replayed for debugging/reconnection
- All game logic goes through actions (no direct state mutations)

### 2. Event System (`main/src/core/events/`)
**Purpose**: Decouple UI from game state using events.

- **`GameEvents.ts`**: Event types and global event emitter
- Events: `STATE_CHANGED`, `CARD_PLACED`, `TURN_ENDED`, `ACTION_EXECUTED`, etc.

**Benefits**:
- UI reacts to state changes via events (not polling)
- Multiple scenes can listen to the same events
- Easy to add network layer that emits events on remote actions

### 3. Pure Game State (`main/src/core/state/`)
**Purpose**: Authoritative, serializable game state.

- **`GameState.ts`**: Pure game state interface (no Phaser objects)
- **`HexData.ts`**: Serializable hex data (separate from Hex visual entity)
- **`UIManager.ts`**: UI-only state (selected cards, hover states)

**Benefits**:
- State can be serialized and synced across clients
- No Phaser objects in state (only data)
- Clear separation between game state and UI state

### 4. Refactored GameStateManager (`main/src/state/GameStateManager.ts`)
**Changes**:
- Now manages `GameState` instead of individual fields
- Processes actions through `executeAction()`
- Emits events on state changes
- Maintains action history for replay

**Backward Compatibility**: Legacy methods still work but delegate to new system.

### 5. Game Rules (`main/src/core/rules/`)
**Purpose**: Deterministic game logic that can run on both client and server.

- **`GameRules.ts`**: Validation functions for actions
- All game logic is pure functions (no side effects)

**Benefits**:
- Same rules run on client (for immediate feedback) and server (for validation)
- Easy to test
- No cheating possible (server validates everything)

## Updated Components

### Hex Entity
- Now uses `PlaceCardAction` instead of directly mutating state
- Tracks row/col position for action system
- Visual updates happen via event listeners

### MapScene
- Initializes game state using `GameStateManager.initializeGame()`
- Listens to state change events to update visuals
- Passes row/col to Hex constructor

### DeploymentScene
- Listens to state change events to update deck display
- No longer directly modifies player deck
- Uses event-driven updates instead of polling

### UIScene
- Listens to events instead of polling in `update()`
- Updates UI reactively when state changes

## Migration Path to Multiplayer

### Phase 1: Current State (Single-Player)
- ✅ Actions are serializable
- ✅ State is serializable
- ✅ Events are emitted
- ✅ All game logic goes through actions

### Phase 2: Add Network Layer (Future)
1. Create `NetworkManager` that:
   - Sends actions to server when executed locally
   - Receives actions from server
   - Executes remote actions via `GameStateManager.executeAction()`
   - Handles reconnection by requesting state sync

2. Server validates actions using `GameRules`
3. Server broadcasts validated actions to all clients
4. Clients replay actions to stay in sync

### Phase 3: Server Authority (Future)
- Server becomes authoritative source of truth
- Client actions are predictions (optimistic updates)
- Server corrections override client predictions
- State reconciliation on conflicts

## Benefits of This Architecture

1. **Multiplayer Ready**: Actions and state are serializable
2. **Testable**: Pure functions for game rules
3. **Debuggable**: Action history allows replay
4. **Maintainable**: Clear separation of concerns
5. **Scalable**: Easy to add new actions and events
6. **Backward Compatible**: Legacy code still works

## Next Steps

1. ✅ Complete action system foundation
2. ✅ Refactor state management
3. ✅ Add event system
4. ✅ Update existing scenes
5. ⏭️ Implement core gameplay (combat, movement, etc.)
6. ⏭️ Add more actions (MoveCardAction, AttackAction, etc.)
7. ⏭️ Add network layer when ready

## Notes

- All actions must be serializable (no functions, no Phaser objects)
- Game state must be pure data (no Phaser objects)
- UI state (selected cards, hover) stays in UIManager (not synced)
- Events are the bridge between game state and UI
