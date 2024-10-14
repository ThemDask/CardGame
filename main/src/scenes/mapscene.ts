import Phaser from 'phaser';
import { Tile } from '../entities/Tile';  
import { CardDetailsPanel } from '../utils/CardDetailsPanel';

export class MapScene extends Phaser.Scene {
    private hexRadius: number;
    private tileMap: Tile[][];
    private cardDetailsPanel: CardDetailsPanel;
    private mapContainer: Phaser.GameObjects.Container;

    constructor() {
        super({ key: 'MapScene' });
        this.hexRadius = 40;  // Adjust this for hex size
        this.tileMap = [];
    }

    preload() {
    }

    create() {
         // Ensure the CardDetailsPanel occupies the leftmost 300px exactly
         this.cardDetailsPanel = new CardDetailsPanel(this, 0, 0, 320, this.cameras.main.height);
         this.cardDetailsPanel.updatePanel(null);  // Example update with no card selected
 
         // Create a container that will take up the space from 300px to the right edge
         const containerX = 300;
         const containerWidth = this.scale.width - containerX;  // Remaining width after the 300px panel
         const containerHeight = this.scale.height;
 
         this.mapContainer = this.add.container(containerX, 0);  // Create container at (300, 0)
         this.mapContainer.setSize(containerWidth, containerHeight);
 
         // Now generate the hex map inside the container
         this.generateHexMap(containerWidth, containerHeight);
    }

     generateHexMap(containerWidth: number, containerHeight: number) {
        const rows = 11;
        const hexMapStructure = [6, 7, 8, 9, 10, 11, 10, 9, 8, 7, 6];
    
        const hexHeight = Math.sqrt(3) * this.hexRadius;
        const hexWidth = 2 * this.hexRadius;
        const xOffset = hexWidth * 0.85;  
        const yOffset = hexHeight * 0.85;  
    
        // Centering the entire map
        const totalMapHeight = rows * yOffset;
        const centerY = (containerHeight - totalMapHeight) / 2;
    
        for (let row = 0; row < rows; row++) {
            this.tileMap[row] = [];
    
            const numberOfHexes = hexMapStructure[row];
            const rowWidth = numberOfHexes * xOffset;  // Total width of the current row
            const centerX = (containerWidth - rowWidth) / 2;  // Center horizontally
    
            const yPos = centerY + row * yOffset;  // Adjust vertical position
    
            for (let col = 0; col < numberOfHexes; col++) {
                const xPos = centerX + col * xOffset;  // Adjust horizontal position for centering
    
                const tile = new Tile(this, xPos, yPos, this.hexRadius, 'default');
                this.tileMap[row].push(tile);

                this.mapContainer.add(tile.hex);


                tile.hex.lineStyle(2, 0xaabbcc);  // White border with 2px thickness
                tile.hex.strokePath();  
    
                // TODO
                tile.hex.on('pointerdown', () => {
                    console.log(`Tile at row ${row}, col ${col} clicked.`);
                });

                tile.hex.on('pointerover', () => {
                    // todo
                });
            }
        }
    }
    
    
    
    
    
    
    

    update() {
    }


    updateHexes() {
        // TODO
    }
}
