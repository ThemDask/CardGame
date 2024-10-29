import Phaser from 'phaser';
import { Hex } from '../entities/Hex';  
import { CardDetailsPanel } from '../utils/CardDetailsPanel';

export class MapScene extends Phaser.Scene {
    private hexRadius: number;
    private hexMap: Hex[][];
    private cardDetailsPanel: CardDetailsPanel;
    private mapContainer: Phaser.GameObjects.Container;
    private containerX: number;
    private containerWidth: number;
    private containerHeight: number


    constructor() {
        super({ key: 'MapScene' });
        this.hexRadius = 55;  
        this.hexMap = [];
        
    }

    preload() {
    }

    create() {

         // Create a container that will take up the space from 300px to the right edge
         const containerWidth = this.game.config.width as number - 300;  
         const containerHeight = this.game.config.height as number;
 
        // ??? TODO fix
        this.mapContainer = this.add.container(300, 0);  
        this.mapContainer.setSize(this.containerWidth, this.containerHeight);

        this.cardDetailsPanel = new CardDetailsPanel(this, 0, 0, 300, containerHeight); 
        this.add.existing(this.cardDetailsPanel);
        this.cardDetailsPanel.updatePanel(null)


        this.generateHexMap(containerWidth, containerHeight);

        // TODO update card details panel
        // cardImage.on('pointerover', () => {
        //     this.cardDetailsPanel.updatePanel(card);
        // });

        // cardImage.on('pointerout', () => {
        //     this.cardDetailsPanel.updatePanel(null);
        // });
    }


    update() {
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
            this.hexMap[row] = [];
    
            const numberOfHexes = hexMapStructure[row];
            const rowWidth = numberOfHexes * xOffset;  // Total width of the current row
            const centerX = (containerWidth - rowWidth) / 2;  // Center horizontally
    
            const yPos = centerY + row * yOffset;  // Adjust vertical position
    
            for (let col = 0; col < numberOfHexes; col++) {
                const xPos = centerX + col * xOffset;  // Adjust horizontal position for centering
    
                const tile = new Hex(this, xPos, yPos, this.hexRadius, 'default');
                this.hexMap[row].push(tile);
    
                this.mapContainer.add(tile.hex);
    
                // DEBUG LOG: Check if listeners are set
                console.log(`Setting listeners for hex at row ${row}, col ${col}`);
    
                // Interactive listeners
                tile.hex.setInteractive({ useHandCursor: true });
    
                tile.hex.on('pointerover', () => {
                    console.log(`Hovering over hex at row ${row}, col ${col}`);
                    tile.redraw('hover');
                });
    
                tile.hex.on('pointerout', () => {
                    console.log(`Pointer out of hex at row ${row}, col ${col}`);
                    tile.redraw('default');
                });
    
                tile.hex.on('pointerdown', () => {
                    console.log(`Clicked on hex at row ${row}, col ${col}`);
                    tile.redraw('click');
                });
            }
        }
    }
    
}
