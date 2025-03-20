import { HexType, hexTypes } from "../utils/styles";
import { GameStateManager } from "../state/GameStateManager";
import { Card } from "./Card";
import { DeploymentScene } from "../scenes/DeploymentScene";

export class Hex {
    occupied: boolean;
    occupiedBy: Card | null;
    type: HexType;
    hex: Phaser.GameObjects.Graphics;
    hexRadius: number;
    defaultFillColor: number = 0x419627; // Default hex fill color
    selected: boolean = false; // Track selection state

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        hexRadius: number,
        type: HexType,
        occupied: boolean = false,
        occupiedBy: Card | null = null
        
    ) {
        this.type = type;
        this.occupied = occupied;
        this.occupiedBy = occupiedBy;
        this.hexRadius = hexRadius;

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

        // Draw the hexagon shape
        this.hex.beginPath();
        this.hex.moveTo(this.hexRadius * Math.cos(-Math.PI / 6), this.hexRadius * Math.sin(-Math.PI / 6));
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
        const selectedCard = GameStateManager.getInstance().getSelectedCard();
        if (!selectedCard || this.occupied) return;

        this.occupied = true;
        this.occupiedBy = selectedCard;

        // Create the card image on the hex
        const cardImage = scene.add.image(this.hex.x+300, this.hex.y+40, selectedCard.imagePath);
        cardImage.setDisplaySize(50, 50);

        // Ensure the image is properly positioned inside the hex
        this.hex.scene.add.existing(cardImage);

        // Remove the card from DeploymentScene's deck
        const deploymentScene = scene.scene.get('DeploymentScene') as DeploymentScene;
        if (deploymentScene) {
            deploymentScene.removeCardFromDeck(selectedCard);
        }

        // Clear selected card after placing it
        GameStateManager.getInstance().setSelectedCard(null);

        this.redraw("click"); // Update hex appearance
    }
}
