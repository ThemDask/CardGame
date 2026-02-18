import { HexType, hexTypes } from "../utils/styles";
import { GameStateManager } from "../state/GameStateManager";
import { Card } from "./Card";
import { DeploymentScene } from "../scenes/DeploymentScene";
import { PlaceCardAction } from "../core/actions/PlaceCardAction";
import { MoveCardAction } from "../core/actions/MoveCardAction";
import { UIManager } from "../core/state/UIManager";

export type HighlightType = 'none' | 'movement' | 'attack';

export class Hex {
    occupied: boolean;
    occupiedBy: Card | null;
    occupiedByPlayerId: string | null = null; // Track which player owns the card
    type: HexType;
    hex: Phaser.GameObjects.Graphics;
    hexRadius: number;
    defaultFillColor: number = 0x419627; // Default hex fill color
    selected: boolean = false; // Track selection state
    highlightType: HighlightType = 'none'; // Track highlight state for movement/attack
    row: number = -1; // Row position in hex map
    col: number = -1; // Column position in hex map

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        hexRadius: number,
        type: HexType,
        occupied: boolean = false,
        occupiedBy: Card | null = null,
        row: number = -1,
        col: number = -1
        
    ) {
        this.type = type;
        this.occupied = occupied;
        this.occupiedBy = occupiedBy;
        this.hexRadius = hexRadius;
        this.row = row;
        this.col = col;

        // Create the visual hex
        this.hex = scene.add.graphics({ x: x, y: y });
        this.hex.lineStyle(2, 0x000000, 1);
        this.drawHex(this.defaultFillColor); // Default fill color
        this.hex.setAlpha(0.8); // Adjust this value between 0 (fully transparent) and 1 (fully opaque)
        // Define a hit area as a polygon that matches the hex shape 
        const hitArea = new Phaser.Geom.Polygon(this.getHexPoints());
        this.hex.setInteractive(hitArea, Phaser.Geom.Polygon.Contains);

        // Add event listeners for pointer events
        this.hex.on('pointerover', () => {
            // Only apply hover if hex is not highlighted for movement/attack
            if (this.highlightType === 'none') {
                this.redraw('hover');
            }
        });

        this.hex.on('pointerout', () => {
            // Restore highlight state if exists, otherwise default
            if (this.highlightType === 'none') {
                this.redraw('default');
            } else {
                this.redraw('highlight');
            }
        });

        this.hex.on('pointerdown', () => {
            // console.log(`Clicked on hex`);
            this.handleClick(scene);
        });
    }

    // Helper method to get the points of the hex for hit area
    getHexPoints(): Phaser.Geom.Point[] {
        const points: Phaser.Geom.Point[] = [];
        const angle = Phaser.Math.DegToRad(60);

        for (let i = 0; i < 6; i++) {
            const x = this.hexRadius * Math.cos(i * angle - Math.PI / 6);
            const y = this.hexRadius * Math.sin(i * angle - Math.PI / 6);
            points.push(new Phaser.Geom.Point(x, y));
        }

        return points;
    }

    drawHex(fillColor: number, borderColor?: number, borderWidth?: number) {
        const angle = Phaser.Math.DegToRad(60);
        this.hex.clear(); // Clear previous drawings
        
        // Use provided border color/width or default
        const strokeColor = borderColor !== undefined ? borderColor : 0x000000;
        const strokeWidth = borderWidth !== undefined ? borderWidth : 2;
        
        this.hex.lineStyle(strokeWidth, strokeColor, 1);
        this.hex.fillStyle(fillColor); // Apply the fill color

        // Draw flat-top hexagon (flat edges on top/bottom)
        // The hex is drawn centered at (0, 0) relative to graphics object
        this.hex.beginPath();
        // Start from top-left vertex
        this.hex.moveTo(this.hexRadius * Math.cos(-Math.PI / 6), this.hexRadius * Math.sin(-Math.PI / 6));
        // Draw all 6 vertices
        for (let i = 1; i <= 6; i++) {
            const x = this.hexRadius * Math.cos(i * angle - Math.PI / 6);
            const y = this.hexRadius * Math.sin(i * angle - Math.PI / 6);
            this.hex.lineTo(x, y);
        }

        this.hex.closePath();
        this.hex.fillPath(); // Fill the shape with the specified color
        this.hex.strokePath(); // Stroke the outline
    }

    redraw(invocation: string) {
        const hexColor = hexTypes[this.type]; // Access the hex type colors based on the current type
        
        // If hex has a highlight (movement/attack), preserve it
        if (this.highlightType === 'movement') {
            this.drawHex(hexColor.default, 0xffffff, 4); // White border for movement
        } else if (this.highlightType === 'attack') {
            this.drawHex(hexColor.default, 0xff0000, 4); // Red border for attack
        } else if (invocation === 'hover') {
            // Only apply hover if not highlighted
            this.drawHex(hexColor.hover); // Use hover color
        } else if (invocation === 'click') {
            this.drawHex(hexColor.click); // Use click color
        } else if (invocation === 'highlight') {
            // Redraw with current highlight state (movement/attack already handled above)
            this.drawHex(hexColor.default);
        } else {
            // Default redraw
            this.drawHex(hexColor.default); // Use default color
        }
    }
    
    /**
     * Set highlight state for movement/attack
     */
    setHighlight(type: HighlightType) {
        this.highlightType = type;
        this.redraw('highlight');
    }
    
    /**
     * Clear highlight state
     */
    clearHighlight() {
        this.highlightType = 'none';
        this.redraw('default');
    }

    handleClick(scene: Phaser.Scene) {
        const gameStateManager = GameStateManager.getInstance();
        const selectedCard = gameStateManager.getSelectedCard();
        const gameState = gameStateManager.getGameState();
        
        if (!gameState) return;

        // Priority 1: If this hex is highlighted for movement/attack, handle that first.
        // This takes precedence because highlighted hexes mean a board card is already
        // selected for movement - the user is clicking a target, not trying to deploy.
        if (this.highlightType !== 'none') {
            const boardCardPos = UIManager.getInstance().getSelectedBoardCardPosition();
            if (boardCardPos) {
                const action = new MoveCardAction(
                    gameState.currentPlayerId,
                    boardCardPos.row,
                    boardCardPos.col,
                    this.row,
                    this.col
                );
                
                const success = gameStateManager.executeAction(action);
                if (!success) {
                    console.warn("Failed to execute move/attack action");
                }
                return;
            }
        }

        // Priority 2: If a deck card is selected, try to place it (deployment)
        if (selectedCard) {
            if (!this.occupied) {
                const currentPlayerId = gameState.currentPlayerId;
                
                // Check if this is a valid deployment hex during deployment phase
                const isDeploymentPhase = gameState.gamePhase === 'deployment';
                if (isDeploymentPhase) {
                    // Only allow deployment on deploy-type hexes (land or water)
                    if (this.type !== 'landDeploy' && this.type !== 'water') {
                        console.warn("Can only deploy on deployment zones");
                        return;
                    }
                    
                    // Check marine unit restrictions - must deploy on water
                    if (selectedCard.keywords && selectedCard.keywords.some((kw: string) => kw.includes('Marine'))) {
                        if (this.type !== 'water') {
                            console.warn("Marine units can only be deployed on water");
                            return;
                        }
                    }
                }
                
                const action = new PlaceCardAction(
                    currentPlayerId,
                    selectedCard.id,
                    this.row,
                    this.col
                );

                const success = gameStateManager.executeAction(action);
                
                if (success) {
                    gameStateManager.setSelectedCard(null);
                    this.redraw("click");
                    
                    // Notify DeploymentScene to update deck display
                    const deploymentScene = scene.scene.get('DeploymentScene') as DeploymentScene;
                    if (deploymentScene) {
                        deploymentScene.onCardPlaced(selectedCard);
                    }
                } else {
                    console.warn("Failed to place card:", selectedCard.name);
                }
            }
        }
    }
}
