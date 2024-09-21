import Phaser from 'phaser';

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
        const defaultStyle = { fontSize: '32px', color: '#ffffff' };
        const hoverStyle = { fontSize: '32px', color: '#0000ff' };
        const clickStyle = { fontSize: '32px', color: '#ffffff' };

        const menuContainer = this.add.container(width / 2, height / 2);

        this.playButton = this.createButton(0, -100, 'Play', defaultStyle, hoverStyle, clickStyle);
        this.deckBuilderButton = this.createButton(0, 0, 'Deck Builder', defaultStyle, hoverStyle, clickStyle);
        this.profileButton = this.createButton(0, 100, 'Profile', defaultStyle, hoverStyle, clickStyle);

        
        // Add all buttons to the container
        menuContainer.add([this.playButton, this.deckBuilderButton, this.profileButton]);

        this.deckBuilderButton.on('pointerdown', () => this.scene.start('DeckBuilderScene'));
    }

    createButton(x: number, y: number, text: string, defaultStyle: Phaser.Types.GameObjects.Text.TextStyle, hoverStyle: Phaser.Types.GameObjects.Text.TextStyle, clickStyle: Phaser.Types.GameObjects.Text.TextStyle) {

        const button = this.add.text(x, y, text, defaultStyle)
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerover', () => {
                button.setStroke('#0000ff', 2); // Blue border on hover
                button.setStyle(hoverStyle); // Change text color on hover
            })
            .on('pointerout', () => {
                button.setStroke('#ffffff', 2); // White border when not hovering
                button.setStyle(defaultStyle); // Revert text color
            })
            .on('pointerdown', () => {
                button.setStroke('#ffffff', 2); // White border on click
                button.setStyle(clickStyle); // Change text color on click
            })
            .on('pointerup', () => {
                button.setStroke('#0000ff', 2); // Blue border on release
                button.setStyle(defaultStyle); // Revert text color
            });

        // Add initial White border
        button.setStroke('#ffffff', 2); 
        
        return button;
}}
