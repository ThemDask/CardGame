import Phaser from 'phaser';
import { buttonOverStroke, buttonOverStyle, buttonOutStroke, buttonOutStyle,
         buttonDownStroke, buttonDownStyle, buttonUpStroke, buttonUpStyle} from '../utils/styles';
import { GameStateManager } from '../state/GameStateManager';
import { configureBackground } from '../utils/helpers/configureBackground';
import { sceneManager } from '../core/sceneManager';

export class MenuScene extends Phaser.Scene {
    private playButton!: Phaser.GameObjects.Text;
    private deckBuilderButton!: Phaser.GameObjects.Text;
    private profileButton!: Phaser.GameObjects.Text;
    private fileInputElement!: HTMLInputElement;
    private modalContainer!: Phaser.GameObjects.Container;

    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('bg', '/assets/bg1.png')

    }

    create() {
      configureBackground(this);

        const { width, height } = this.scale;
        const menuContainer = this.add.container(width / 2, height / 2);

        this.playButton = this.createButton(0, -100, 'Play');
        this.deckBuilderButton = this.createButton(0, 0, 'Deck Builder');
        this.profileButton = this.createButton(0, 100, 'Profile');

        
        // Add all buttons to the container
        menuContainer.add([this.playButton, this.deckBuilderButton, this.profileButton]);

        this.deckBuilderButton.on('pointerdown', () => sceneManager.goToDeckBuilder(this));
         // Add the file input element
         this.createFileInput();

         // Add event listener for the play button to show the modal
         this.playButton.on('pointerdown', () => {
             this.startMapScene();
         });
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
    }

    private createFileInput() {
        // Create an invisible file input element
        this.fileInputElement = document.createElement('input');
        this.fileInputElement.type = 'file';
        this.fileInputElement.accept = '.json';
        this.fileInputElement.style.display = 'none';

        // Append to document body so it can be accessed
        document.body.appendChild(this.fileInputElement);

        // Set up event listener to handle file reading
        this.fileInputElement.addEventListener('change', (event: Event) => {
            const input = event.target as HTMLInputElement;
            if (input.files && input.files.length > 0) {
                const file = input.files[0];
                const reader = new FileReader();
                
                reader.onload = (e: ProgressEvent<FileReader>) => {
                    if (e.target && typeof e.target.result === 'string') {
                        try {
                            const deckData = JSON.parse(e.target.result);
                            this.validateDeck(deckData);
                        } catch (error) {
                            console.error('Invalid JSON format:', error);
                            alert('Failed to load deck. Please upload a valid JSON file.');
                        }
                    }
                };
                
                reader.readAsText(file);
            }
        });
    }

    private validateDeck(deckData: any) {
        // Validate the loaded deck data structure
        if (Array.isArray(deckData)) {
            console.log('Loaded deck:', deckData);
            sceneManager.startGame(this, deckData);
        } else {
            alert('Invalid Deck. Please construct one in Deck Builder, save it and load it here.');
        }
    }

    // Cleanup to avoid memory leaks
    shutdown() {
        if (this.fileInputElement) {
            this.fileInputElement.remove();
        }
    }

    startMapScene() {
        const gameStateManager = GameStateManager.getInstance();
        const selectedDeck = gameStateManager.getSelectedDeck();
    
        if (!selectedDeck) {
            // Show a prompt to select a deck in DeckBuilderScene.
            this.add.text(400, 300, 'Please select a deck in Deck Builder!', { font: '24px Arial', color: '#ff0000' }).setOrigin(0.5);
        } else {
            sceneManager.startGame(this, selectedDeck);
        }
    }

    private showModal() {
        const { width, height } = this.scale;
        if (this.modalContainer) {
            this.modalContainer.destroy(); // Remove existing modal if present
        }

        // Create a new container for the modal
        this.modalContainer = this.add.container(width / 2, height / 2);

        // Create the modal background
        const modalBg = this.add.rectangle(0, 0, 700, 300, 0x000000, 0.8)
            .setStrokeStyle(2, 0xffffff);
        this.modalContainer.add(modalBg);

        // Create the 'Saved Decks' section
        const savedDecksTitle = this.add.text(-200, -120, 'Saved Decks', { font: '24px Arial', color: '#ffffff' });
        this.modalContainer.add(savedDecksTitle);

        const savedDecksBox = this.add.rectangle(0, 0, 400, 150, 0x222222)
            .setStrokeStyle(2, 0xffffff);
        this.modalContainer.add(savedDecksBox);

        // Add placeholders for saved decks
        // TODO save decks in-game in DeckBuilderScene
        const savedDecksPlaceholder = this.add.text(-180, -50, 'Deck 1\nDeck 2\nDeck 3', { fontSize: '20px', color: '#dddddd' });
        this.modalContainer.add(savedDecksPlaceholder);

        // Create the 'Upload Deck' button
        const uploadDeckButton = this.add.text(-200, 100, 'Upload Deck',  { font: '24px Arial', color: '#ffffff' });
        uploadDeckButton.setInteractive();
        this.modalContainer.add(uploadDeckButton);

        uploadDeckButton.on('pointerdown', () => {
            this.fileInputElement.click();
        });

        // Create the 'X' button to close the modal
        const closeButton = this.add.text(330, -130, 'X', { font: '24px Arial', color: '#ff0000' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.modalContainer.destroy(); // Close the modal
            });

        this.modalContainer.add(closeButton);
    }
}
