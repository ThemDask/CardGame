import Phaser from 'phaser';
import { Hex } from '../entities/Hex';  
import { Player } from '../entities/Player';
import { HexType, hexTypes } from '../utils/styles';
import { GameStateManager } from '../state/GameStateManager';
import { Card } from '../entities/Card';
import { configureBackground } from '../utils/helpers/configureBackground';
import cardData from '../../../public/cardData.json';
import { GameEventEmitter, GameEventType } from '../core/events/GameEvents';
import { EnemyAI } from '../utils/helpers/EnemyAI';
import { GameRules } from '../core/rules/GameRules';
import { MoveCardAction } from '../core/actions/MoveCardAction';
import { ShootCardAction } from '../core/actions/ShootCardAction';
import { UIManager } from '../core/state/UIManager';
import { sceneManager } from '../core/sceneManager';
import { CardContextMenu } from '../utils/CardContextMenu';

// Map scene - has impl of the hexmap and calls card details panel
export class MapScene extends Phaser.Scene {
    private hexRadius: number;
    private zoomScale: number;
    private zoomLevels: number[];
    private hexMap: Hex[][];
    private mapContainer: Phaser.GameObjects.Container;
    private containerWidth: number;
    private containerHeight: number;
    private player1: Player;
    private player2: Player;
    private hexMapConfig: Array<Array<HexType>>;
    private cardSprites: Map<string, Phaser.GameObjects.Image> = new Map();
    private selectedCardHex: {row: number, col: number} | null = null;
    private highlightedHexes: Set<string> = new Set();
    private cardContextMenu: CardContextMenu;
    private enemyDeck: Card[] | undefined;


    constructor() {
        super({ key: 'MapScene' });
        this.hexRadius = 55;  

        this.zoomScale = 1; // Initial zoom scale
        this.zoomLevels = [0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45, 1.5, 1.55, 1.6, 1.65, 1.7, 1.75, 1.8, 1.85, 1.9, 1.95, 2]; // 4 zoom stages (plus initial)
        this.hexMap = [];

        this.hexMapConfig = [
            ['pinkTP', 'landDeploy', 'landDeploy', 'landDeploy', 'pinkTP'], 
            ['orangeTP', 'landDeploy', 'landDeploy', 'landDeploy', 'landDeploy', 'orangeTP', ], 
            ['purpleTP', 'land', 'land', 'land', 'land', 'land', 'purpleTP'], 
            ['whiteTP', 'water', 'water', 'water', 'water', 'water', 'water', 'whiteTP'],
            ['yellowTP', 'land', 'land', 'land', 'land', 'land', 'yellowTP'],
            ['AzureTP', 'landDeploy', 'landDeploy', 'landDeploy', 'landDeploy', 'AzureTP'],
            ['redTP', 'landDeploy', 'landDeploy', 'landDeploy', 'redTP'],
        ];
    }

    init(data: { playerDeck: string[] | Card[], enemyDeck?: Card[] }) {
        console.log("data transferred: ", data.playerDeck);
        const deckIds = data.playerDeck || [];
        
        let initialDeck: Card[];
        if (deckIds.length > 0 && typeof deckIds[0] === 'string') {
            initialDeck = (deckIds as string[]).map(id => {
                const cardDataItem = (cardData as any[]).find(c => c.id === id);
                if (!cardDataItem) {
                    throw new Error(`Card with ID ${id} not found`);
                }
                return new Card(
                    cardDataItem.id,
                    cardDataItem.type,
                    cardDataItem.name,
                    cardDataItem.movement ?? 0,
                    cardDataItem.damage ?? 0,
                    cardDataItem.ranged_damage ?? 0,
                    cardDataItem.range ?? 0,
                    cardDataItem.hp ?? 0,
                    cardDataItem.actions ?? (cardDataItem as any).cost ?? 0,
                    cardDataItem.description ?? "",
                    cardDataItem.imagePath,
                    cardDataItem.keywords || []
                );
            });
        } else {
            initialDeck = deckIds as Card[];
        }
    
        this.player1 = new Player("Player 1", initialDeck, 300);
        this.player2 = new Player("Player 2", [], 300);
        this.enemyDeck = data.enemyDeck;
    }

    preload() {
        try {
            this.load.image('archer', '/assets/archer.png'); 
            this.load.image('damage', '/assets/damage.png'); 
            this.load.image('health', '/assets/hp.png'); 
            this.load.image('movement', '/assets/movement.png'); 
            this.load.image('range', '/assets/range.png'); 
            this.load.image('ranged_dmg', '/assets/ranged_dmg.png'); 
            this.load.image('bg', '/assets/bg1.png');
        } catch (error) {
            console.error("Error loading assets:", error);
        }
    }

    create() {
        configureBackground(this);
        this.scene.launch('PhaseBannerScene', { phase: 'deployment' });
        this.scene.bringToTop('PhaseBannerScene');

        const containerWidth = this.game.config.width as number;  
        const containerHeight = this.game.config.height as number;

        this.mapContainer = this.add.container(300, 40);  
        this.mapContainer.setSize(this.containerWidth, this.containerHeight);

        // Generate hex map first
        this.generateHexMap(containerWidth, containerHeight);
        
        // Initialize game state with players and hex map
        const gameStateManager = GameStateManager.getInstance();
        gameStateManager.initializeGame(this.player1, this.player2, this.hexMap);
        
        const deployedEnemyCards = EnemyAI.deployEnemyCards(this.hexMapConfig, this.enemyDeck);
        deployedEnemyCards.forEach(({ card, row, col }) => {
            this.createCardVisual(card, row, col);
        });
        
        // Set up enemy AI auto-turn
        EnemyAI.setupAutoTurn();
        
        // Set up event listeners for state changes
        this.setupEventListeners();

        // EXAMPLE OF GETTING HEX
        // this.hexMap[1][2].drawHex(hexColors.land);

        // Listen for mouse wheel events to zoom
        this.input.on('wheel', (_pointer: Phaser.Input.Pointer, _currentlyOver: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
            if (dy > 0) this.zoomOut();
            else if (dy < 0) this.zoomIn();
        });

        this.input.keyboard?.on('keydown-ESC', () => {
            sceneManager.openEscapeMenu(this);
        });

        // Card context menu (Move/Attack, Shoot, Activate Ability)
        this.cardContextMenu = new CardContextMenu(
            this,
            (r, c) => this.onContextMenuMoveAttack(r, c),
            (r, c) => this.onContextMenuShoot(r, c),
            (_r, _c) => { /* Activate Ability - no-op for now */ }
        );
        this.add.existing(this.cardContextMenu);

        this.scene.launch('DeploymentScene');
        this.scene.launch('UIScene');
    }


    update() {
    }
    
    private setupEventListeners() {
        GameEventEmitter.on(GameEventType.STATE_CHANGED, (_event: any) => {
            this.updateHexMapVisuals();
        }, this);

        GameEventEmitter.on(GameEventType.PHASE_CHANGED, (data: { phase: string }) => {
            if (data?.phase === 'combat') {
                this.scene.launch('PhaseBannerScene', { phase: 'combat' });
                this.scene.bringToTop('PhaseBannerScene');
            }
        }, this);
        
        GameEventEmitter.on(GameEventType.CARD_PLACED, (event: any) => {
            this.handleCardPlaced(event);
        }, this);

        GameEventEmitter.on(GameEventType.CARD_MOVED, (event: any) => {
            this.handleCardMoved(event);
        }, this);

        GameEventEmitter.on(GameEventType.CARD_ATTACKED, (event: any) => {
            this.handleCardAttacked(event);
        }, this);

        GameEventEmitter.on(GameEventType.CARD_DESTROYED, (event: any) => {
            this.handleCardDestroyed(event);
        }, this);
    }
    
    
    /**
     * Create visual representation of card on hex
     */
    private createCardVisual(card: Card, row: number, col: number) {
        const hex = this.hexMap[row]?.[col];
        if (!hex) {
            console.warn(`Cannot create card visual: Hex at row ${row}, col ${col} not found`);
            return;
        }
        
        const key = `${row}-${col}`;
        
        // Remove old visual if exists at this position
        if (this.cardSprites.has(key)) {
            const oldSprite = this.cardSprites.get(key);
            if (oldSprite && oldSprite.active) {
                const actionsText = (oldSprite as any).actionsText;
                if (actionsText && actionsText.active) actionsText.destroy(true);
                oldSprite.destroy(true);
            }
            this.cardSprites.delete(key);
        }
        
        // Clear visualSprite reference if it points to a destroyed sprite
        if (card.visualSprite && !card.visualSprite.active) {
            card.visualSprite = null;
        }
        
        // Use placeholder if image not loaded, otherwise use card image path
        // Check if the image path exists, if not use archer placeholder
        let imageKey = 'archer'; // Default placeholder
        if (card.imagePath && this.textures.exists(card.imagePath)) {
            imageKey = card.imagePath;
        } else if (card.imagePath) {
            // Try to load the image if it's not loaded yet
            // For now, just use placeholder
            console.log(`Card image not loaded: ${card.imagePath}, using placeholder`);
        }
        
        try {
            // Get hex center position in world coordinates
            // hex.hex is a Graphics object added to mapContainer
            // We need to get the world position accounting for container transform
            const hexLocalX = hex.hex.x;
            const hexLocalY = hex.hex.y;
            
            // Convert container-local coordinates to world coordinates
            const hexWorldX = this.mapContainer.x + hexLocalX;
            const hexWorldY = this.mapContainer.y + hexLocalY;
            
            // Calculate card size based on current zoom level and hex radius
            // Base size is 80px, scale proportionally with hex radius
            const baseHexRadius = 55; // Original hex radius
            const currentHexRadius = hex.hexRadius;
            const scaleFactor = currentHexRadius / baseHexRadius;
            const cardSize = 80 * scaleFactor;
            
            // Create card image centered on hex (in world coordinates)
            const cardImage = this.add.image(hexWorldX, hexWorldY, imageKey);
            cardImage.setDisplaySize(cardSize, cardSize);
            cardImage.setOrigin(0.5, 0.5); // Center origin
            cardImage.setDepth(10); // Above hexes

            // Show actions stat on the card (map scene only)
            const actionsText = this.add.text(hexWorldX + cardSize / 2 - 4, hexWorldY + cardSize / 2 - 4, `A:${card.remainingActions ?? card.actions}`, {
                font: `${Math.max(10, Math.floor(12 * scaleFactor))}px Arial`,
                color: '#ffffff'
            }).setOrigin(1, 1).setDepth(11);
            actionsText.setStroke('#000000', 2);

            // Store both so we can destroy the text when card is removed
            this.cardSprites.set(key, cardImage);
            (cardImage as any).actionsText = actionsText;
            card.visualSprite = cardImage;
            
            // Make card interactive for selection and hover
            cardImage.setInteractive();
            cardImage.on('pointerdown', () => {
                this.handleCardClick(row, col);
            });
            cardImage.on('pointerover', () => {
                this.showCardDetailsOnHover(card);
            });
            cardImage.on('pointerout', () => {
                this.hideCardDetailsOnHover();
            });
        } catch (error) {
            console.error(`Failed to create card visual for ${card.name}:`, error);
        }
    }
    
    /**
     * Show card details in CardDetailsPanel when hovering over a map card (same as DeckBuilderScene/DeploymentScene)
     */
    private showCardDetailsOnHover(card: Card) {
        const deploymentScene = this.scene.get('DeploymentScene');
        if (deploymentScene && deploymentScene.scene.isActive()) {
            deploymentScene.events.emit('cardHover', card);
        }
    }

    /**
     * Hide card details when pointer leaves a map card
     */
    private hideCardDetailsOnHover() {
        const deploymentScene = this.scene.get('DeploymentScene');
        if (deploymentScene && deploymentScene.scene.isActive()) {
            deploymentScene.events.emit('cardHover', null);
        }
    }

    /**
     * Handle card click - selection for movement/attack, or attacking an enemy
     */
    private handleCardClick(row: number, col: number) {
        const gameStateManager = GameStateManager.getInstance();
        const gameState = gameStateManager.getGameState();
        if (!gameState) {
            console.warn("Game state not available");
            return;
        }
        
        const hex = gameState.hexMap[row]?.[col];
        if (!hex) {
            console.warn(`Hex at row ${row}, col ${col} not found in game state`);
            return;
        }
        
        const currentPlayerId = gameState.currentPlayerId;
        
        // Case 1: Clicking own card - show context menu (before any move/attack logic)
        if (hex.occupied && hex.occupiedByPlayerId === currentPlayerId && hex.occupiedBy) {
            if (gameState.gamePhase === 'deployment') {
                return;
            }
            // If context menu is open for this card, close it (toggle)
            if (this.cardContextMenu.isOpenFor(row, col)) {
                this.cardContextMenu.close();
                return;
            }
            
            // Clear previous selection and highlights
            this.deselectCard();
            gameStateManager.setSelectedCard(null);
            
            // Show context menu for this card (or switch to new card if menu was open for another)
            const visualHex = this.hexMap[row]?.[col];
            if (visualHex) {
                const hexWorldX = this.mapContainer.x + visualHex.hex.x;
                const hexWorldY = this.mapContainer.y + visualHex.hex.y;
                this.cardContextMenu.open(hexWorldX, hexWorldY, row, col, hex.occupiedBy);
            }
            return;
        }
        
        // Case 2: Clicking enemy card while own card is selected (attack or shoot)
        if (hex.occupied && hex.occupiedByPlayerId !== currentPlayerId && this.selectedCardHex) {
            const visualHex = this.hexMap[row]?.[col];
            if (visualHex && visualHex.highlightType === 'attack') {
                this.executeMoveAction(this.selectedCardHex.row, this.selectedCardHex.col, row, col);
                return;
            }
            if (visualHex && visualHex.highlightType === 'shoot') {
                this.executeShootAction(this.selectedCardHex.row, this.selectedCardHex.col, row, col);
                return;
            }
        }
        
        // Case 3: Clicking elsewhere - deselect
        if (this.selectedCardHex) {
            this.deselectCard();
        }
    }

    /**
     * Deselect the currently selected board card and clear all highlights
     */
    private deselectCard() {
        if (this.selectedCardHex) {
            const prevHex = this.hexMap[this.selectedCardHex.row]?.[this.selectedCardHex.col];
            if (prevHex) prevHex.redraw('default');
        }
        this.selectedCardHex = null;
        UIManager.getInstance().setSelectedBoardCardPosition(null);
        this.clearAllHighlights();
    }

    /**
     * Highlight all hexes reachable by the selected card for movement or attack
     */
    private highlightReachableHexes(row: number, col: number) {
        const gameState = GameStateManager.getInstance().getGameState();
        if (!gameState) return;
        
        const hex = gameState.hexMap[row]?.[col];
        if (!hex || !hex.occupiedBy) return;
        
        const card = hex.occupiedBy;
        const currentPlayerId = gameState.currentPlayerId;
        
        // Check if card has remaining actions
        if ((card.remainingActions ?? card.actions) <= 0) return;
        
        const reachable = GameRules.getReachableHexes(gameState, row, col, card.movement, currentPlayerId);
        
        for (const target of reachable) {
            const visualHex = this.hexMap[target.row]?.[target.col];
            if (visualHex) {
                visualHex.setHighlight(target.type);
                this.highlightedHexes.add(`${target.row}-${target.col}`);
            }
        }
    }

    /**
     * Clear all movement/attack highlights from hexes
     */
    private clearAllHighlights() {
        for (const key of this.highlightedHexes) {
            const [row, col] = key.split('-').map(Number);
            const hex = this.hexMap[row]?.[col];
            if (hex) {
                hex.clearHighlight();
            }
        }
        this.highlightedHexes.clear();
    }

    /**
     * Execute a move/attack action from source to target hex.
     * Post-action selection is handled by handleCardMoved event listener.
     */
    private executeMoveAction(fromRow: number, fromCol: number, toRow: number, toCol: number) {
        const gameState = GameStateManager.getInstance().getGameState();
        if (!gameState) return;
        
        const action = new MoveCardAction(
            gameState.currentPlayerId,
            fromRow,
            fromCol,
            toRow,
            toCol
        );
        
        const success = GameStateManager.getInstance().executeAction(action);
        
        if (!success) {
            console.warn("Failed to execute move action");
        }
    }

    /**
     * Execute a shoot action from source to target hex.
     * Post-action selection is handled by handleCardAttacked.
     */
    private executeShootAction(fromRow: number, fromCol: number, toRow: number, toCol: number) {
        const gameState = GameStateManager.getInstance().getGameState();
        if (!gameState) return;

        const action = new ShootCardAction(
            gameState.currentPlayerId,
            fromRow,
            fromCol,
            toRow,
            toCol
        );

        const success = GameStateManager.getInstance().executeAction(action);

        if (!success) {
            console.warn("Failed to execute shoot action");
        }
    }

    /**
     * Context menu callback: Move/Attack - select card and highlight reachable hexes
     */
    private onContextMenuMoveAttack(row: number, col: number) {
        const gameState = GameStateManager.getInstance().getGameState();
        if (!gameState) return;

        const hex = gameState.hexMap[row]?.[col];
        if (!hex || !hex.occupiedBy) return;

        this.selectedCardHex = { row, col };
        UIManager.getInstance().setSelectedBoardCardPosition({ row, col });

        if (this.hexMap[row]?.[col]) {
            this.hexMap[row][col].redraw('click');
        }

        this.highlightReachableHexes(row, col);
    }

    /**
     * Context menu callback: Shoot - select card and highlight shootable hexes
     */
    private onContextMenuShoot(row: number, col: number) {
        const gameState = GameStateManager.getInstance().getGameState();
        if (!gameState) return;

        const hex = gameState.hexMap[row]?.[col];
        if (!hex || !hex.occupiedBy) return;

        this.selectedCardHex = { row, col };
        UIManager.getInstance().setSelectedBoardCardPosition({ row, col });

        if (this.hexMap[row]?.[col]) {
            this.hexMap[row][col].redraw('click');
        }

        this.highlightShootableHexes(row, col);
    }

    /**
     * Highlight all hexes that can be shot at by the selected card (enemy hexes within range)
     */
    private highlightShootableHexes(row: number, col: number) {
        const gameState = GameStateManager.getInstance().getGameState();
        if (!gameState) return;

        const hex = gameState.hexMap[row]?.[col];
        if (!hex || !hex.occupiedBy) return;

        const card = hex.occupiedBy;
        const currentPlayerId = gameState.currentPlayerId;

        if ((card.remainingActions ?? card.actions) <= 0) return;
        if ((card.range ?? 0) <= 0) return;

        const shootable = GameRules.getShootableHexes(gameState, row, col, card.range, currentPlayerId);

        for (const target of shootable) {
            const visualHex = this.hexMap[target.row]?.[target.col];
            if (visualHex) {
                visualHex.setHighlight('shoot');
                this.highlightedHexes.add(`${target.row}-${target.col}`);
            }
        }
    }

    /**
     * Helper to destroy a card sprite and its associated text at a given key
     */
    private destroySpriteAt(key: string) {
        if (this.cardSprites.has(key)) {
            const sprite = this.cardSprites.get(key);
            if (sprite && sprite.active) {
                const actionsText = (sprite as any).actionsText;
                if (actionsText && actionsText.active) actionsText.destroy(true);
                sprite.destroy(true);
            }
            this.cardSprites.delete(key);
        }
    }

    /**
     * Handle card moved event - update card sprite positions and manage selection.
     * This fires for all moves (from Hex click or card sprite click), so it handles
     * highlight clearing and re-selection universally.
     */
    private handleCardMoved(event: any) {
        const { fromRow, fromCol, toRow, toCol, playerId } = event;
        const sourceKey = `${fromRow}-${fromCol}`;
        const targetKey = `${toRow}-${toCol}`;
        
        // Remove old sprites at both source and target
        this.destroySpriteAt(sourceKey);
        this.destroySpriteAt(targetKey);
        
        // Read updated game state and recreate visuals where needed
        const gameState = GameStateManager.getInstance().getGameState();
        if (!gameState) return;
        
        // Recreate sprite at source if card is still there (attack where defender survived)
        const sourceHex = gameState.hexMap[fromRow]?.[fromCol];
        if (sourceHex && sourceHex.occupied && sourceHex.occupiedBy) {
            this.createCardVisual(sourceHex.occupiedBy, fromRow, fromCol);
        }
        
        // Recreate sprite at target (card moved there, or defender survived there)
        const targetHex = gameState.hexMap[toRow]?.[toCol];
        if (targetHex && targetHex.occupied && targetHex.occupiedBy) {
            this.createCardVisual(targetHex.occupiedBy, toRow, toCol);
        }
        
        // Post-move selection management (only for current player's moves)
        if (playerId === gameState.currentPlayerId) {
            this.clearAllHighlights();
            
            // Determine where the card ended up
            const cardStayedAtSource = sourceHex && sourceHex.occupied &&
                sourceHex.occupiedByPlayerId === playerId;
            const cardMovedToTarget = targetHex && targetHex.occupied &&
                targetHex.occupiedByPlayerId === playerId;
            
            const actualRow = cardStayedAtSource ? fromRow : (cardMovedToTarget ? toRow : -1);
            const actualCol = cardStayedAtSource ? fromCol : (cardMovedToTarget ? toCol : -1);
            
            if (actualRow >= 0) {
                const cardHex = gameState.hexMap[actualRow]?.[actualCol];
                if (cardHex && cardHex.occupiedBy &&
                    (cardHex.occupiedBy.remainingActions ?? 0) > 0) {
                    // Card has remaining actions - re-select it
                    this.selectedCardHex = { row: actualRow, col: actualCol };
                    UIManager.getInstance().setSelectedBoardCardPosition({ row: actualRow, col: actualCol });
                    if (this.hexMap[actualRow]?.[actualCol]) {
                        this.hexMap[actualRow][actualCol].redraw('click');
                    }
                    this.highlightReachableHexes(actualRow, actualCol);
                    return;
                }
            }
            
            // No more actions - fully deselect
            this.selectedCardHex = null;
            UIManager.getInstance().setSelectedBoardCardPosition(null);
        }
    }

    /**
     * Handle card attacked event - for shoot actions, clear highlights and re-select if card has actions left.
     * (Melee attacks are handled by handleCardMoved.)
     */
    private handleCardAttacked(event: any) {
        const { fromRow, fromCol } = event;
        // Shoot: attacker stays at fromRow, fromCol. Melee: attacker may move to toRow, toCol.
        // If selectedCardHex is still at (fromRow, fromCol), this was a shoot (card didn't move).
        if (this.selectedCardHex?.row === fromRow && this.selectedCardHex?.col === fromCol) {
            this.clearAllHighlights();
            const gameState = GameStateManager.getInstance().getGameState();
            if (!gameState) return;

            const sourceHex = gameState.hexMap[fromRow]?.[fromCol];
            const card = sourceHex?.occupiedBy;
            if (card && (card.remainingActions ?? 0) > 0) {
                this.selectedCardHex = { row: fromRow, col: fromCol };
                UIManager.getInstance().setSelectedBoardCardPosition({ row: fromRow, col: fromCol });
                if (this.hexMap[fromRow]?.[fromCol]) {
                    this.hexMap[fromRow][fromCol].redraw('click');
                }
                this.highlightShootableHexes(fromRow, fromCol);
            } else {
                this.selectedCardHex = null;
                UIManager.getInstance().setSelectedBoardCardPosition(null);
                if (this.hexMap[fromRow]?.[fromCol]) {
                    this.hexMap[fromRow][fromCol].redraw('default');
                }
            }
        }
    }

    /**
     * Handle card destroyed event
     */
    private handleCardDestroyed(event: any) {
        const { row, col } = event;
        this.destroySpriteAt(`${row}-${col}`);
    }
    
    /**
     * Handle card placement event
     */
    private handleCardPlaced(event: any) {
        const { hexRow, hexCol } = event;
        const gameState = GameStateManager.getInstance().getGameState();
        if (!gameState) return;
        
        const hex = gameState.hexMap[hexRow]?.[hexCol];
        if (hex && hex.occupiedBy) {
            // Get the visual hex to create card at correct position
            const visualHex = this.hexMap[hexRow]?.[hexCol];
            if (visualHex) {
                this.createCardVisual(hex.occupiedBy, hexRow, hexCol);
            }
        }
    }
    
    
    private updateHexMapVisuals() {
        const gameState = GameStateManager.getInstance().getGameState();
        if (!gameState) return;
        
        // Update hex visuals based on game state
        for (let row = 0; row < this.hexMap.length; row++) {
            for (let col = 0; col < this.hexMap[row].length; col++) {
                const hex = this.hexMap[row][col];
                const stateHex = gameState.hexMap[row]?.[col];
                
                if (stateHex) {
                    // Update hex data
                    hex.occupied = stateHex.occupied;
                    hex.occupiedBy = stateHex.occupiedBy;
                    hex.occupiedByPlayerId = stateHex.occupiedByPlayerId;
                    
                    // Update card visual if needed
                    if (stateHex.occupied && stateHex.occupiedBy) {
                        const key = `${row}-${col}`;
                        if (!this.cardSprites.has(key)) {
                            // Card was placed but visual doesn't exist, create it
                            this.createCardVisual(stateHex.occupiedBy, row, col);
                        } else {
                            // Card exists, update its position, size, and remaining actions for current zoom
                            const sprite = this.cardSprites.get(key);
                            if (sprite && hex) {
                                const hexWorldX = this.mapContainer.x + hex.hex.x;
                                const hexWorldY = this.mapContainer.y + hex.hex.y;
                                sprite.x = hexWorldX;
                                sprite.y = hexWorldY;
                                
                                // Update size based on zoom
                                const baseHexRadius = 55;
                                const currentHexRadius = hex.hexRadius;
                                const scaleFactor = currentHexRadius / baseHexRadius;
                                const cardSize = 80 * scaleFactor;
                                sprite.setDisplaySize(cardSize, cardSize);
                                
                                // Update remaining actions display
                                const actionsText = (sprite as any).actionsText;
                                if (actionsText && actionsText.active && stateHex.occupiedBy) {
                                    actionsText.setText(`A:${stateHex.occupiedBy.remainingActions ?? stateHex.occupiedBy.actions}`);
                                }
                            }
                        }
                    } else if (!stateHex.occupied) {
                        // Card was removed, destroy visual
                        const key = `${row}-${col}`;
                        if (this.cardSprites.has(key)) {
                            const sprite = this.cardSprites.get(key);
                            if (sprite && sprite.active) {
                                sprite.destroy(true); // Destroy and remove from scene
                            }
                            this.cardSprites.delete(key);
                        }
                    }
                }
            }
        }
    }


    generateHexMap(containerWidth: number, containerHeight: number) {
        const rows = this.hexMapConfig.length; // Total rows (based on map config)
        const hexHeight = Math.sqrt(3) * this.hexRadius; // Height of a hexagon
        const hexWidth = 2 * this.hexRadius; // Width of a hexagon
        const xOffset = hexWidth * 0.85; // Horizontal offset (flat-top hexes side by side)
        const yOffset = hexHeight * 0.85; // Vertical offset
    
        // Centering the entire map
        const totalMapHeight = rows * yOffset; 
        const centerY = (containerHeight - totalMapHeight) / 2; 
    
        this.hexMap = []; // Initialize hexMap as an empty array
    
        for (let row = 0; row < rows; row++) {
            this.hexMap[row] = []; // Initialize each row as an empty array
    
            const numberOfHexes = this.hexMapConfig[row].length; 
            const rowWidth = numberOfHexes * xOffset; 
            const centerX = (containerWidth - rowWidth) / 2; // Center horizontally
    
            const yPos = centerY + row * yOffset; // Adjust vertical position
    
            for (let col = 0; col < numberOfHexes; col++) {
                const xPos = centerX + col * xOffset; // Adjust horizontal position for centering
    
                const hexType = this.hexMapConfig[row][col] as HexType;
                const tile = new Hex(this, xPos, yPos, this.hexRadius, hexType, false, null, row, col);
                tile.drawHex(hexTypes[hexType].default);

                this.hexMap[row].push(tile);
    
                this.mapContainer.add(tile.hex); 
    
                // Store row/col position inside hex for reference
                tile.hex.setData({ row, col });
            }
        }
    }

    zoomIn() {
        const pointer = this.input.activePointer;
    
        // Check if the cursor's x-position is >= 500
        if (pointer.x >= 500) {
            const currentIndex = this.zoomLevels.indexOf(this.zoomScale);
            if (currentIndex < this.zoomLevels.length - 1) {
                this.zoomScale = this.zoomLevels[currentIndex + 1];
                this.redrawMap(); // This will recreate hexes and cards at new zoom level
            }
        }
    }
    
    zoomOut() {
        const pointer = this.input.activePointer;
    
        // Check if the cursor's x-position is >= 500
        if (pointer.x >= 500) {
            const currentIndex = this.zoomLevels.indexOf(this.zoomScale);
            if (currentIndex > 0) {
                this.zoomScale = this.zoomLevels[currentIndex - 1];
                this.redrawMap(); // This will recreate hexes and cards at new zoom level
            }
        }
    }
    
    redrawMap() {
        const containerWidth = this.game.config.width as number;
        const containerHeight = this.game.config.height as number;
    
        const rows = this.hexMapConfig.length; // Total rows (based on map config)
        const scaledRadius = this.hexRadius * this.zoomScale;
        const hexHeight = Math.sqrt(3) * scaledRadius; // Height of a hexagon, scaled
        const hexWidth = 2 * scaledRadius; // Width of a hexagon, scaled
        const xOffset = hexWidth * 0.85; // Horizontal offset (matching generateHexMap)
        const yOffset = hexHeight * 0.85; // Vertical offset
    
        // Centering the entire map
        const totalMapHeight = rows * yOffset; 
        const centerY = (containerHeight - totalMapHeight) / 2; 
    
        // Store existing card visuals before clearing (get from gameState, not visual hexMap)
        const gameState = GameStateManager.getInstance().getGameState();
        const cardVisualsToRestore: Array<{card: Card, row: number, col: number}> = [];
        
        if (gameState) {
            // Get card data from gameState before clearing hexMap
            for (let row = 0; row < gameState.hexMap.length; row++) {
                for (let col = 0; col < gameState.hexMap[row].length; col++) {
                    const stateHex = gameState.hexMap[row][col];
                    if (stateHex && stateHex.occupied && stateHex.occupiedBy) {
                        cardVisualsToRestore.push({ card: stateHex.occupiedBy, row, col });
                    }
                }
            }
        }

        // Destroy all existing card sprites before clearing (they're added to scene, not container)
        // This prevents duplicate card images when zooming
        this.cardSprites.forEach((sprite, key) => {
            if (sprite) {
                // Clear visualSprite reference on card if it exists
                const [row, col] = key.split('-').map(Number);
                const gameState = GameStateManager.getInstance().getGameState();
                if (gameState) {
                    const stateHex = gameState.hexMap[row]?.[col];
                    if (stateHex && stateHex.occupiedBy && stateHex.occupiedBy.visualSprite === sprite) {
                        stateHex.occupiedBy.visualSprite = null;
                    }
                }
                const actionsText = (sprite as any).actionsText;
                if (actionsText && actionsText.active) actionsText.destroy(true);
                if (sprite.active) {
                    sprite.destroy(true);
                }
            }
        });
        this.cardSprites.clear(); // Clear card sprite references
        
        // Clear selection and highlights since hex objects are being recreated
        this.highlightedHexes.clear();
        this.selectedCardHex = null;
        UIManager.getInstance().setSelectedBoardCardPosition(null);
        
        // Clear any previous hexes from the container
        this.mapContainer.removeAll(true); // This ensures all existing hexes are removed before drawing new ones
    
        this.hexMap = []; // Reinitialize hexMap as an empty array
    
        // Now we redraw the hex map with the new zoom scale
        for (let row = 0; row < rows; row++) {
            this.hexMap[row] = []; // Initialize each row as an empty array
    
            const numberOfHexes = this.hexMapConfig[row].length; 
            const rowWidth = numberOfHexes * xOffset; 
            const centerX = (containerWidth - rowWidth) / 2; // Center horizontally
    
            const yPos = centerY + row * yOffset; // Adjust vertical position
    
            for (let col = 0; col < numberOfHexes; col++) {
                const xPos = centerX + col * xOffset; // Adjust horizontal position for centering
    
                const hexType = this.hexMapConfig[row][col] as HexType;
                const tile = new Hex(this, xPos, yPos, scaledRadius, hexType, false, null, row, col);
                tile.drawHex(hexTypes[hexType].default);
    
                this.hexMap[row].push(tile); // Add the tile to the hex map array
    
                this.mapContainer.add(tile.hex); // Add the tile to the map container
            }
        }
        
        // Restore card visuals at new positions (after hex map is redrawn)
        cardVisualsToRestore.forEach(({ card, row, col }) => {
            this.createCardVisual(card, row, col);
        });
    }


        // Optional: If you add images to the hexes, you should scale them in this function as well
        // Example:
        // this.hexMap.forEach(row => {
        //     row.forEach(hex => {
        //         hex.updateImagesScale(this.zoomScale);
        //     });
        // });
}
    

