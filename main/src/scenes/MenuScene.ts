import Phaser from 'phaser';
import { buttonOverStroke, buttonOverStyle, buttonOutStroke, buttonOutStyle,
         buttonDownStroke, buttonDownStyle, buttonUpStroke, buttonUpStyle} from '../utils/styles';

export class MenuScene extends Phaser.Scene {
    private playButton!: Phaser.GameObjects.Text;
    private deckBuilderButton!: Phaser.GameObjects.Text;
    private profileButton!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {

    }

    create() {

        // Get the width and height of the canvas
        const { width, height } = this.scale;

        // Define button styles
        // const defaultStyle = { fontSize: '32px', color: '#ffffff' };
        // const hoverStyle = { fontSize: '32px', color: '#0000ff' };
        // const clickStyle = { fontSize: '32px', color: '#ffffff' };

        const menuContainer = this.add.container(width / 2, height / 2);

        this.playButton = this.createButton(0, -100, 'Play');
        this.deckBuilderButton = this.createButton(0, 0, 'Deck Builder');
        this.profileButton = this.createButton(0, 100, 'Profile');

        
        // Add all buttons to the container
        menuContainer.add([this.playButton, this.deckBuilderButton, this.profileButton]);

        this.deckBuilderButton.on('pointerdown', () => this.scene.start('DeckBuilderScene'));
        this.playButton.on('pointerdown', () => this.scene.start('MapScene'));
    }

    createButton(x: number, y: number, text: string) {

        const button = this.add.text(x, y, text, buttonOutStyle)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerover', () => {
                button.setStroke(buttonOverStroke.colour, buttonOverStroke.thickness); // Blue border on hover
                button.setStyle(buttonOverStyle); // Change text color on hover
            })
            .on('pointerout', () => {
                button.setStroke(buttonOutStroke.colour, buttonOutStroke.thickness); // White border when not hovering
                button.setStyle(buttonOutStyle); // Revert text color
            })
            .on('pointerdown', () => {
                button.setStroke(buttonDownStroke.colour, buttonDownStroke.thickness); // White border on click
                button.setStyle(buttonDownStyle); // Change text color on click
            })
            .on('pointerup', () => {
                button.setStroke(buttonUpStroke.colour, buttonUpStroke.thickness); // Blue border on release
                button.setStyle(buttonUpStyle); // Revert text color
            });

        // Add initial White border
        button.setStroke(buttonOutStroke.colour, buttonOutStroke.thickness); 
        
        return button;
}}
