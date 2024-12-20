import Phaser from 'phaser';
import { Hex } from '../entities/Hex';  
import { CardDetailsPanel } from '../utils/CardDetailsPanel';
import { Player } from '../entities/Player';
import { HexType, hexTypes } from '../utils/styles';
import { GameStateManager } from '../state/GameStateManager';
import { DeckDisplayModal } from '../utils/DeckDisplayModal';
import { Card } from '../entities/Card';

export class MapScene extends Phaser.Scene {
    private hexRadius: number;
    private zoomScale: number;
    private maxZoom: number;
    private minZoom: number;
    private zoomLevels: number[];
    private hexMap: Hex[][];
    private cardDetailsPanel: CardDetailsPanel;
    private mapContainer: Phaser.GameObjects.Container;
    private containerX: number;
    private containerWidth: number;
    private containerHeight: number;
    private player1: Player;
    private player2: Player;
    private hexMapConfig: Array<Array<HexType>>;
    private deckDisplay: DeckDisplayModal;
    private modalOverlay: Phaser.GameObjects.Rectangle;
    private modalButton: Phaser.GameObjects.Text;


    constructor() {
        super({ key: 'MapScene' });
        this.hexRadius = 55;  

        this.zoomScale = 1; // Initial zoom scale
        this.zoomLevels = [0.5, 0.75, 1, 1.25, 1.5]; // 4 zoom stages (plus initial)
        this.minZoom = this.zoomLevels[0]; // Minimum zoom
        this.maxZoom = this.zoomLevels[this.zoomLevels.length - 1]; // Maximum zoom
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

    init(data: { playerDeck: Card[] }) {
        console.log("data transferred: ", data.playerDeck);
        const initialDeck = data.playerDeck || [];
    
        this.player1 = new Player("Player 1", initialDeck, 300);
        GameStateManager.getInstance().setPlayer1(this.player1);

        this.player2 = new Player("Player 2", [], 300);
        GameStateManager.getInstance().setPlayer2(this.player2);
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
        // TODO set this to start after deployment
        setInterval(() => this.player1.countSeconds(true), 1000/*ms*/)

        const containerWidth = this.game.config.width as number;  
        const containerHeight = this.game.config.height as number;

        this.mapContainer = this.add.container(300, 40);  
        this.mapContainer.setSize(this.containerWidth, this.containerHeight);

        this.cardDetailsPanel = new CardDetailsPanel(this, 0, 0, 450, 600); 
        this.add.existing(this.cardDetailsPanel);
        this.cardDetailsPanel.updatePanel(null)

        this.generateHexMap(containerWidth, containerHeight);

        // EXAMPLE OF GETTING HEX
        // this.hexMap[1][2].drawHex(hexColors.land);

        // Listen for mouse wheel events to zoom
        this.input.on('wheel', (pointer: Phaser.Input.Pointer, _currentlyOver: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
            if (dy > 0) this.zoomOut();
            else if (dy < 0) this.zoomIn();
        });

        this.scene.launch('UIScene');

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
    
                const hexType = this.hexMapConfig[row][col] as HexType;
                const tile = new Hex(this, xPos, yPos, this.hexRadius, hexType);
                tile.drawHex(hexTypes[hexType].default);

                this.hexMap[row].push(tile);
    
                this.mapContainer.add(tile.hex); 
            }
        }
    }

    zoomIn() {
        const currentIndex = this.zoomLevels.indexOf(this.zoomScale);
        if (currentIndex < this.zoomLevels.length - 1) {
            this.zoomScale = this.zoomLevels[currentIndex + 1];
            this.redrawMap();
        }
    }
    
    zoomOut() {
        const currentIndex = this.zoomLevels.indexOf(this.zoomScale);
        if (currentIndex > 0) {
            this.zoomScale = this.zoomLevels[currentIndex - 1];
            this.redrawMap();
        }
    }
    
    redrawMap() {
        const containerWidth = this.game.config.width as number;
        const containerHeight = this.game.config.height as number;
    
        const rows = this.hexMapConfig.length; // Total rows (based on map config)
        const hexHeight = Math.sqrt(3) * this.hexRadius * this.zoomScale; // Height of a hexagon, scaled
        const hexWidth = 2 * this.hexRadius * this.zoomScale; // Width of a hexagon, scaled
        const xOffset = hexWidth * 0.85; // Horizontal offset
        const yOffset = hexHeight * 0.85; // Vertical offset
    
        // Centering the entire map
        const totalMapHeight = rows * yOffset; 
        const centerY = (containerHeight - totalMapHeight) / 2; 
    
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
                const tile = new Hex(this, xPos, yPos, this.hexRadius * this.zoomScale, hexType); // Use the scaled radius
                tile.drawHex(hexTypes[hexType].default);
    
                this.hexMap[row].push(tile); // Add the tile to the hex map array
    
                this.mapContainer.add(tile.hex); // Add the tile to the map container
            }
        }
    }

        // Optional: If you add images to the hexes, you should scale them in this function as well
        // Example:
        // this.hexMap.forEach(row => {
        //     row.forEach(hex => {
        //         hex.updateImagesScale(this.zoomScale);
        //     });
        // });
}
    

