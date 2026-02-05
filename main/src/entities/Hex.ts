import { HexType, hexTypes } from "../utils/styles";
import { GameStateManager } from "../state/GameStateManager";
import { Card } from "./Card";
import { DeploymentScene } from "../scenes/DeploymentScene";
import { PlaceCardAction } from "../core/actions/PlaceCardAction";
import { GameEventEmitter, GameEventType, CardPlacedEvent } from "../core/events/GameEvents";

export class Hex {
    occupied: boolean;
    occupiedBy: Card | null;
    occupiedByPlayerId: string | null = null; // Track which player owns the card
    type: HexType;
    hex: Phaser.GameObjects.Graphics;
    hexRadius: number;
    defaultFillColor: number = 0x419627; // Default hex fill color
    selected: boolean = false; // Track selection state
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
            // console.log(`Hovering over hex`);
            this.redraw('hover');
        });

        this.hex.on('pointerout', () => {
            // console.log(`Pointer out of hex`);
            this.redraw('default');
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

    drawHex(fillColor: number) {
        const angle = Phaser.Math.DegToRad(60);
        this.hex.clear(); // Clear previous drawings
        this.hex.lineStyle(2, 0x000000, 1); // Set the line color again (optional)
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
        if (invocation === 'hover') {
            // console.log('Hovering redraw');
            this.drawHex(hexColor.hover); // Use hover color
        } else if (invocation === 'click') {
            // console.log('Click redraw');
            this.drawHex(hexColor.click); // Use click color
        } else {
            // console.log('Default redraw');
            this.drawHex(hexColor.default); // Use default color
        }
    }

    handleClick(scene: Phaser.Scene) {
        const gameStateManager = GameStateManager.getInstance();
        const selectedCard = gameStateManager.getSelectedCard();
        const gameState = gameStateManager.getGameState();
        
        if (!gameState) return;

        // If card is selected from deck, place it
        if (selectedCard && !this.occupied) {
            const currentPlayerId = gameState.currentPlayerId;
            
            // Check if this is a valid deployment hex during deployment phase
            const isDeploymentPhase = gameState.gamePhase === 'deployment';
            if (isDeploymentPhase) {
                // Only allow deployment on deploy-type hexes
                if (this.type !== 'landDeploy' && this.type !== 'waterDeploy') {
                    console.warn("Can only deploy on deployment zones");
                    return;
                }
                
                // Check marine unit restrictions
                if (selectedCard.keywords && selectedCard.keywords.some((kw: string) => kw.includes('Marine'))) {
                    if (this.type !== 'waterDeploy') {
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
        // If hex is clicked without card selected, let MapScene handle it
        // (for movement/attack selection)
    }
}
