import { HexType, hexTypes } from "../utils/styles";

export class Hex {
    occupied: boolean;
    occupiedBy: string | null;
    type: HexType;
    hex: Phaser.GameObjects.Graphics;
    hexRadius: number;
    defaultFillColor: number = 0x419627; // Default hex fill color

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        hexRadius: number,
        type: HexType,
        occupied: boolean = false,
        occupiedBy: string | null = null
    ) {
        this.type = type;
        this.occupied = occupied;
        this.occupiedBy = occupiedBy;
        this.hexRadius = hexRadius;

        // Create the visual hex
        this.hex = scene.add.graphics({ x: x, y: y });
        this.hex.lineStyle(2, 0x000000, 1);
        this.drawHex(this.defaultFillColor); // Default fill color

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
            this.redraw('click');
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
            console.log('Hovering redraw');
            this.drawHex(hexColor.hover); // Use hover color
        } else if (invocation === 'click') {
            console.log('Click redraw');
            this.drawHex(hexColor.click); // Use click color
        } else {
            console.log('Default redraw');
            this.drawHex(hexColor.default); // Use default color
        }
    }
}
