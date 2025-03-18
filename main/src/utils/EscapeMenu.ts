import Phaser from 'phaser';
import { textFont, buttonOverStroke, buttonOutStroke, buttonDownStroke } from './styles'

export class EscapeMenu extends Phaser.Scene {
    private menuContainer!: Phaser.GameObjects.Container;
    private overlay!: Phaser.GameObjects.Rectangle;
    
    constructor() {
        super({ key: 'EscapeMenu' });
    }
    

    create() {
        // **Overlay to dim the background**
        this.overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.5)
            .setOrigin(0, 0);

        // **Menu Background**
        const menuWidth = 400;
        const menuHeight = 250;
        const centerX = this.scale.width / 2;
        const centerY = this.scale.height / 2;

        const menuBackground = this.add.rectangle(centerX, centerY, menuWidth, menuHeight, 0x222222, 1)
            .setStrokeStyle(3, 0xffffff)
            .setOrigin(0.5);

        // **Exit Button**
        const exitButton = this.createButton(centerX, centerY - 50, 'Exit', () => {
            this.scene.stop(); 
            this.scene.start('MenuScene'); 
        });

        // **Mute Button (Placeholder)**
        const muteButton = this.createButton(centerX, centerY + 50, 'Mute Volume', () => {
            console.log('Mute button clicked (no functionality yet)');
        });

        // **Container for all UI elements**
        this.menuContainer = this.add.container(0, 0, [this.overlay, menuBackground, exitButton, muteButton]);

        // **Close Menu on Escape Press**
        this.input.keyboard?.on('keydown-ESC', () => {
            this.scene.stop();
        });
    }

    private createButton(x: number, y: number, text: string, onClick: () => void): Phaser.GameObjects.Container {
        const buttonWidth = 250;
        const buttonHeight = 60;

        // Button background
        const buttonRect = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x444444)
            .setStrokeStyle(buttonOutStroke.thickness, Phaser.Display.Color.HexStringToColor(buttonOutStroke.colour).color)
            .setOrigin(0.5)
            .setInteractive();

        // Button text
        const buttonText = this.add.text(x, y, text, textFont)
            .setOrigin(0.5);

        // Button interactivity
        buttonRect.on('pointerover', () => {
            buttonRect.setStrokeStyle(buttonOverStroke.thickness, Phaser.Display.Color.HexStringToColor(buttonOverStroke.colour).color);
        });

        buttonRect.on('pointerout', () => {
            buttonRect.setStrokeStyle(buttonOutStroke.thickness, Phaser.Display.Color.HexStringToColor(buttonOutStroke.colour).color);
        });

        buttonRect.on('pointerdown', () => {
            buttonRect.setStrokeStyle(buttonDownStroke.thickness, Phaser.Display.Color.HexStringToColor(buttonDownStroke.colour).color);
        });

        buttonRect.on('pointerup', () => {
            buttonRect.setStrokeStyle(buttonOverStroke.thickness, Phaser.Display.Color.HexStringToColor(buttonOverStroke.colour).color);
            onClick();
        });

        return this.add.container(0, 0, [buttonRect, buttonText]);
    }
}
