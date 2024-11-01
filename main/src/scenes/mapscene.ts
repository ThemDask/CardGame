import Phaser from 'phaser';
import { Hex } from '../entities/Hex';  
import { CardDetailsPanel } from '../utils/CardDetailsPanel';
import { Player } from '../entities/Player';
import { HexType, hexTypes } from '../utils/styles';

export class MapScene extends Phaser.Scene {
    private hexRadius: number;
    private hexMap: Hex[][];
    private cardDetailsPanel: CardDetailsPanel;
    private mapContainer: Phaser.GameObjects.Container;
    private containerX: number;
    private containerWidth: number;
    private containerHeight: number;
    private player: Player;
    private hexMapConfig: Array<Array<HexType>>;


    constructor() {
        super({ key: 'MapScene' });
        this.hexRadius = 55;  
        this.hexMap = [];

        this.hexMapConfig = [
            ['landDeploy', 'landDeploy', 'landDeploy', 'landDeploy', 'landDeploy', 'landDeploy'], 
            ['landDeploy', 'landDeploy', 'landDeploy', 'landDeploy', 'landDeploy', 'landDeploy', 'landDeploy'], 
            ['land', 'landDeploy', 'waterDeploy', 'waterDeploy', 'waterDeploy', 'waterDeploy', 'landDeploy', 'land'], 
            ['land', 'land', 'water', 'water', 'water', 'water', 'water', 'land', 'land'],
            ['land', 'land', 'water', 'water', 'land', 'land', 'water', 'water', 'land', 'land'],
            ['mine', 'land', 'water', 'water', 'land', 'objective', 'land', 'water', 'water', 'land', 'mine'],
            ['land', 'land', 'water', 'water', 'land', 'land', 'water', 'water', 'land', 'land'],
            ['land', 'land', 'water', 'water', 'water', 'water', 'water', 'land', 'land'],
            ['land', 'landDeploy', 'waterDeploy', 'waterDeploy', 'waterDeploy', 'waterDeploy', 'landDeploy', 'land'],
            ['landDeploy', 'landDeploy', 'landDeploy', 'landDeploy', 'landDeploy', 'landDeploy', 'landDeploy'],
            ['landDeploy', 'landDeploy', 'landDeploy', 'landDeploy', 'landDeploy', 'landDeploy'],
        ];
    }

    preload() {
        this.load.image('archer', '/assets/archer.png'); 
        this.load.image('damage', '/assets/damage.png'); 
        this.load.image('health', '/assets/hp.png'); 
        this.load.image('movement', '/assets/movement.png'); 
        this.load.image('range', '/assets/range.png'); 
        this.load.image('ranged_dmg', '/assets/ranged_dmg.png'); 
    }

    create() {
        const containerWidth = this.game.config.width as number;  
        const containerHeight = this.game.config.height as number;

        this.player = new Player("TestPlayer", [])

        this.mapContainer = this.add.container(300, 40);  
        this.mapContainer.setSize(this.containerWidth, this.containerHeight);

        this.cardDetailsPanel = new CardDetailsPanel(this, 0, 0, 500, containerHeight); 
        this.add.existing(this.cardDetailsPanel);
        this.cardDetailsPanel.updatePanel(null)

        setInterval(() => this.player.countSeconds(true), 1000)
        this.generateHexMap(containerWidth, containerHeight);

        // EXAMPLE OF GETTING HEX
        // this.hexMap[1][2].drawHex(hexColors.land);
    }


    update() {
    }


    generateHexMap(containerWidth: number, containerHeight: number) {
        const rows = this.hexMapConfig.length; // Total rows (based on map config)
        const hexHeight = Math.sqrt(3) * this.hexRadius; // Height of a hexagon
        const hexWidth = 2 * this.hexRadius; // Width of a hexagon
        const xOffset = hexWidth * 0.85; // Horizontal offset
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
                
                const hexType = this.hexMapConfig[row][col] as HexType; // Get the hex type from the config
    
                const tile = new Hex(this, xPos, yPos, this.hexRadius, hexType);
    
                tile.drawHex(hexTypes[hexType].default);
                this.hexMap[row].push(tile); // Add the tile to the hexMap
    
                this.mapContainer.add(tile.hex); // Add the hex to the map container
            }
        }
    }
    
    
    
}
