export class Tile {
    occupied: boolean;
    occupiedBy: string | null;
    type: string;
    hex: Phaser.GameObjects.Graphics;
    hexRadius: number;

    constructor(
        scene: Phaser.Scene, 
        x: number, 
        y: number, 
        hexRadius: number, 
        type: string, 
        occupied: boolean = false, 
        occupiedBy: string | null = null
    ) {
        this.type = type;
        this.occupied = occupied;
        this.occupiedBy = occupiedBy;
        this.hexRadius = hexRadius;

        // Create the visual hexagon for this tile
        this.hex = scene.add.graphics({ x: x, y: y });
        this.hex.lineStyle(2, 0xffffff, 1);

        this.drawHex(0x419627); // Default color

        this.hex.setInteractive();
    }

    // Method to draw the hexagon shape with a specific fill color
    // Method to draw the hexagon shape with a specific fill color
    drawHex(color: number) {
        const angle = Phaser.Math.DegToRad(60);  // 60-degree angles for hexagon sides
        this.hex.beginPath();
        this.hex.fillStyle(color);

        // Start at the top pointy part of the hex
        this.hex.moveTo(this.hexRadius * Math.cos(-Math.PI / 6), this.hexRadius * Math.sin(-Math.PI / 6));

        // Loop to create the hexagon shape
        for (let i = 1; i <= 6; i++) {
            const x = this.hexRadius * Math.cos(i * angle - Math.PI / 6);  // Rotate 30 degrees for pointy top
            const y = this.hexRadius * Math.sin(i * angle - Math.PI / 6);
            this.hex.lineTo(x, y);
        }
        
        this.hex.closePath();
        this.hex.fillPath();
        this.hex.strokePath();  // Draws the border around the hex
    }


    // Method to set the tile as occupied
    occupyTile(entity: string) {
        this.occupied = true;
        this.occupiedBy = entity;
        this.drawHex(0x00ff00);  // Change color to indicate occupation
    }

    // Method to release the tile
    releaseTile() {
        this.occupied = false;
        this.occupiedBy = null;
        this.drawHex(0xffffff);  // Reset color
    }

    // Method to check if the tile is occupied
    isOccupied(): boolean {
        return this.occupied;
    }
}
