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
    private cardSprites: Map<string, Phaser.GameObjects.Image> = new Map(); // Track card visuals
    private selectedCardHex: {row: number, col: number} | null = null; // For click highlight feedback


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

    init(data: { playerDeck: string[] | Card[] }) {
        console.log("data transferred: ", data.playerDeck);
        const deckIds = data.playerDeck || [];
        
        // Convert deck IDs to Card objects if needed
        let initialDeck: Card[];
        if (deckIds.length > 0 && typeof deckIds[0] === 'string') {
            // Deck is array of IDs, convert to Card objects
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
        
        // Note: Game state will be initialized in create() after hex map is generated
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
        
        const containerWidth = this.game.config.width as number;  
        const containerHeight = this.game.config.height as number;

        this.mapContainer = this.add.container(300, 40);  
        this.mapContainer.setSize(this.containerWidth, this.containerHeight);

        // Generate hex map first
        this.generateHexMap(containerWidth, containerHeight);
        
        // Initialize game state with players and hex map
        const gameStateManager = GameStateManager.getInstance();
        gameStateManager.initializeGame(this.player1, this.player2, this.hexMap);
        
        // Deploy enemy cards and create their visuals
        const deployedEnemyCards = EnemyAI.deployEnemyCards(this.hexMapConfig);
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

        // this.input.on('pointerdown', this.handleHexClick, this);

        // IMPORTANT! toogle here
        this.scene.launch('DeploymentScene')
        this.scene.launch('UIScene');

    }


    update() {
    }
    
    private setupEventListeners() {
        // Listen for state changes to update visuals
        GameEventEmitter.on(GameEventType.STATE_CHANGED, (_event: any) => {
            this.updateHexMapVisuals();
        }, this);
        
        GameEventEmitter.on(GameEventType.CARD_PLACED, (event: any) => {
            this.handleCardPlaced(event);
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
            const actionsText = this.add.text(hexWorldX + cardSize / 2 - 4, hexWorldY + cardSize / 2 - 4, `A:${card.actions}`, {
                font: `${Math.max(10, Math.floor(12 * scaleFactor))}px Arial`,
                color: '#ffffff'
            }).setOrigin(1, 1).setDepth(11);
            actionsText.setStroke('#000000', 2);

            // Store both so we can destroy the text when card is removed
            this.cardSprites.set(key, cardImage);
            (cardImage as any).actionsText = actionsText;
            card.visualSprite = cardImage;
            
            // Make card interactive for selection
            cardImage.setInteractive();
            cardImage.on('pointerdown', () => {
                this.handleCardClick(row, col);
            });
        } catch (error) {
            console.error(`Failed to create card visual for ${card.name}:`, error);
        }
    }
    
    /**
     * Handle card click (for selection highlight feedback)
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
        
        // If clicking own card, show click highlight feedback
        if (hex.occupied && hex.occupiedByPlayerId === currentPlayerId) {
            // Clear previous hex highlight if selecting a different card
            if (this.selectedCardHex && 
                (this.selectedCardHex.row !== row || this.selectedCardHex.col !== col)) {
                const prevHex = this.hexMap[this.selectedCardHex.row]?.[this.selectedCardHex.col];
                if (prevHex) prevHex.redraw('default');
            }
            
            this.selectedCardHex = { row, col };
            if (this.hexMap[row] && this.hexMap[row][col]) {
                this.hexMap[row][col].redraw('click');
            }
        }
        // If clicking elsewhere, clear selection highlight
        else if (this.selectedCardHex) {
            const prevHex = this.hexMap[this.selectedCardHex.row]?.[this.selectedCardHex.col];
            if (prevHex) prevHex.redraw('default');
            this.selectedCardHex = null;
        }
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
                            // Card exists, update its position and size for current zoom
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
    

