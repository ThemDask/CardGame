import Phaser from 'phaser';
import { Card } from '../entities/Card'; 
import { CardDetailsPanel } from '../utils/CardDetailsPanel';
import { resizeAndCenterImage } from '../utils/helpers/resizeAndCenterImage';
import { createGlobalCardPool } from '../utils/helpers/createGlobalCardPool';
import cardData from '../../../public/cardData.json';
import { buttonOverStroke, buttonOverStyle, buttonOutStroke, buttonOutStyle,
    buttonDownStroke, buttonDownStyle, buttonUpStroke, buttonUpStyle} from '../utils/styles';


export class DeckBuilderScene extends Phaser.Scene {
    private gold: number;
    private myDeck: Card[];
    private globalPool: Card[];
    private myDeckContainer: Phaser.GameObjects.Container;
    private globalPoolContainer: Phaser.GameObjects.Container;
    private cardDetailsPanel: CardDetailsPanel;
    private myDeckMask: Phaser.GameObjects.Graphics;
    private globalPoolMask: Phaser.GameObjects.Graphics;
    private loadDeckButtonRect: Phaser.GameObjects.Rectangle;
    private loadDeckButtonText: Phaser.GameObjects.Text;
    private saveDeckButtonRect: Phaser.GameObjects.Rectangle;
    private saveDeckButtonText: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'DeckBuilderScene' });
        this.gold = 100; 
        this.myDeck = []; 
        this.globalPool = createGlobalCardPool(true); 
    }

    preload() {
        this.load.image('Goblin', '/assets/crossbow.png'); 
        this.load.image('archer', '/assets/archer.png'); 
        this.load.image('banner', '/assets/banner.png'); 
    }

    create() {
        this.cardDetailsPanel = new CardDetailsPanel(this, 0, 0, 300, this.cameras.main.height); 
        this.cardDetailsPanel.updatePanel(null);

        this.createDeckRectangles();

        this.add.text(1000, 50, `Gold: ${this.gold}`, { font: '32px Arial', color: '#ffffff' });


        this.myDeckContainer = this.add.container(320, 100);
        this.globalPoolContainer = this.add.container(1220, 100);

        this.displayDeck(this.myDeck, 'My Deck', this.myDeckContainer, 320, 100); 
        this.displayDeck(this.globalPool, 'Global Pool', this.globalPoolContainer, 1220, 100);

        // Add mask for scrolling areas
        this.createScrollingMasks();

        // add save/load deck buttons
        this.createDeckButtons()

        this.createBackButton()
    }

    createBackButton() {
        const backButton = this.add.text(1730, 960, 'Back', { fontSize: '36px', color: '#ffffff', strokeThickness: 2 })
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.stop('DeckBuilderScene');
                this.scene.start('MenuScene');
            })
            .on('pointerover', () => {
                backButton.setStroke(buttonOverStroke.colour, buttonOverStroke.thickness);
                backButton.setStyle(buttonOverStyle);
            })
            .on('pointerout', () => {
                backButton.setStroke(buttonOutStroke.colour, buttonOutStroke.thickness);
                backButton.setStyle(buttonOutStyle);
            })
            .on('pointerup', () => {
                backButton.setStroke(buttonUpStroke.colour, buttonUpStroke.thickness);
                backButton.setStyle(buttonUpStyle);
            });
    }

    createDeckRectangles() {
        const myDeckRect = this.add.rectangle(320, 100, 600, 800).setStrokeStyle(5, 0xffffff).setOrigin(0);
        myDeckRect.setInteractive();
        const globalPoolRect = this.add.rectangle(1220, 100, 600, 800).setStrokeStyle(5, 0xffffff).setOrigin(0);
        globalPoolRect.setInteractive();
    
        this.add.text(320, 50, 'My Deck', { font: '32px Arial', color: '#ffffff' });
        this.add.text(1220, 50, 'Global Pool', { font: '32px Arial', color: '#ffffff' });
    
        // Input for deck scrolling
        this.input.on('wheel', (pointer: Phaser.Input.Pointer, _currentlyOver: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
            let selectedDeck = null;
    
            //check if cursor is within myDeck or globalPool rectangles 
            if (pointer.x >= myDeckRect.x && pointer.x <= myDeckRect.x + myDeckRect.width &&
                pointer.y >= myDeckRect.y && pointer.y <= myDeckRect.y + myDeckRect.height) {
                selectedDeck = 'myDeckContainer';
            } else if (pointer.x >= globalPoolRect.x && pointer.x <= globalPoolRect.x + globalPoolRect.width &&
                       pointer.y >= globalPoolRect.y && pointer.y <= globalPoolRect.y + globalPoolRect.height) {
                selectedDeck = 'globalPoolContainer';
            }
    
            if (selectedDeck) {
                this.handleScroll(dy, selectedDeck);
            }
        });
    }

    displayDeck(cards: Card[], _label: string, container: Phaser.GameObjects.Container, _x: number, _y: number) {
        // Loop through all slots for the deck
        for (let i = 0; i < 100; i++) {
 
            const slotX = (i % 5) * 110; // Adjusted to be relative to the container// ??? Can't this be done better ? TODO Fix
            const slotY = Math.floor(i / 5) * 140;
    
            // Draw empty slot background (if no card)
            const slotBackground = this.add.rectangle(slotX, slotY, 100, 120).setStrokeStyle(2, 0xffffff).setOrigin(0);
            container.add(slotBackground); // Add slot background to the container
    
            if (i < cards.length) {
                const card = cards[i];
                const cardImage = this.add.image(slotX + 50, slotY + 60, card.imagePath).setDisplaySize(100, 120);
    
                // Resize and center the card image within the slot
                const boundingBox = new Phaser.Geom.Rectangle(slotX, slotY, 100, 120);
                resizeAndCenterImage(cardImage, boundingBox);
    
                container.add(cardImage); 
    
                cardImage.setInteractive();
                cardImage.on('pointerdown', () => {
                    this.handleCardClick(card, container === this.myDeckContainer); // Detect if it's 'My Deck'
                });
    
                // Display card gold value
                const goldText = this.add.text(slotX + 10, slotY + 10, `${card.cost}`, { font: '18px Arial', color: '#000' });
                container.add(goldText); 
    
                cardImage.on('pointerover', () => {
                    this.cardDetailsPanel.updatePanel(card);
                });
    
                cardImage.on('pointerout', () => {
                    this.cardDetailsPanel.updatePanel(null);
                });
            }
        }
    }
    
    createDeckButtons() {
        this.loadDeckButtonRect = this.add.rectangle(550,950, 120,50).setStrokeStyle(3, 0xffffff).setOrigin(0);
        this.saveDeckButtonRect = this.add.rectangle(690,950, 120,50).setStrokeStyle(3, 0xffffff).setOrigin(0);

        this.loadDeckButtonText = this.add.text(this.loadDeckButtonRect.getCenter().x, this.loadDeckButtonRect.getCenter().y, 'Load Deck', { font: '20px Arial', color: '#fff' }).setOrigin(0.5);
        this.saveDeckButtonText = this.add.text(this.saveDeckButtonRect.getCenter().x, this.saveDeckButtonRect.getCenter().y, 'Save Deck', { font: '20px Arial', color: '#fff' }).setOrigin(0.5);

        this.loadDeckButtonRect.setInteractive();
        this.saveDeckButtonRect.setInteractive();

        this.saveDeckButtonRect.on('pointerdown', () => {
            this.saveDeckButtonRect.setFillStyle(0x7fffb2)
            this.saveDeck()
        });

        this.loadDeckButtonRect.on('pointerdown', () => {
            this.loadDeckButtonRect.setFillStyle(0x7fffb2);
            this.loadDeck()
        });

        this.saveDeckButtonRect.on('pointerup', () => {
            this.saveDeckButtonRect.setFillStyle(0x000000)
        });

        this.loadDeckButtonRect.on('pointerup', () => {
            this.loadDeckButtonRect.setFillStyle(0x000000)
        });

        this.saveDeckButtonRect.on('pointerover', () => {
            this.saveDeckButtonRect.setFillStyle(0x7fffb2)
        });

        this.loadDeckButtonRect.on('pointerover', () => {
            this.loadDeckButtonRect.setFillStyle(0x7fffb2)
        });

        this.saveDeckButtonRect.on('pointerout', () => {
            this.saveDeckButtonRect.setFillStyle(0x000000)
        });

        this.loadDeckButtonRect.on('pointerout', () => {
            this.loadDeckButtonRect.setFillStyle(0x000000)
        });

    }

    saveDeck() {
        console.log("saved");
        const deckIds = this.myDeck.map(card => card.id); 
        const jsonData = JSON.stringify(deckIds, null, 2); 
    
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create a temporary anchor element to trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'my_deck.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async loadDeck() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
    
        input.addEventListener('change', async (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file) return;
    
            const reader = new FileReader();
            reader.onload = async (e) => {
                const contents = e.target?.result as string;
    
                // Ensure we have contents to parse
                if (!contents) {
                    console.error("Loaded file is empty");
                    return;
                }
    
                try {
                    const loadedIds: string[] = JSON.parse(contents);
    
                    // reset gold and deck
                    this.myDeck = [];
                    this.gold = 100; 
    
                    loadedIds.forEach(id => {
                        const originalCard = cardData.find((card: any) => card.id === id);
                        if (originalCard) {
                            const card = new Card(
                                originalCard.id,
                                originalCard.type,
                                originalCard.name,
                                originalCard.movement ?? 0,  
                                originalCard.damage ?? 0,     
                                originalCard.ranged_damage ?? 0, 
                                originalCard.range ?? 0,       
                                originalCard.hp ?? 0,          
                                originalCard.cost ?? 0,        
                                originalCard.description ?? "",
                                originalCard.imagePath,
                                originalCard.keywords || []
                            );
                            this.myDeck.push(card);
                            this.gold -= card.cost; 
                        } else {
                            console.warn(`Card with ID ${id} not found in card data.`);
                        }
                    });

                    this.scene.restart();

                } catch (error) {
                    console.error("Error processing loaded deck:", error);
                }
            };
    
            reader.readAsText(file); 
        });
    
        input.click(); 
    }
    
    handleCardClick(card: Card, isMyDeck: boolean) {
        if (isMyDeck) {
            // Remove card from 'My Deck'
            const index = this.myDeck.indexOf(card);
            if (index > -1) {
                this.myDeck.splice(index, 1);
                this.globalPool.push(card); 
                this.gold += card.cost; 
            }
        } else { 
            // Add card to 'My Deck' if there's enough gold and space
            if (this.gold >= card.cost && this.myDeck.length < 40) {
                this.gold -= card.cost;
                this.myDeck.push(card);
                const index = this.globalPool.indexOf(card);
                this.globalPool.splice(index, 1); // Remove card from global pool
            }
        }
        // Redraw the scene
        this.scene.restart();
    }

    createScrollingMasks() {
        // Create mask for "My Deck"
        this.myDeckMask = this.add.graphics();
        this.myDeckMask.fillRect(320, 100, 600, 800);
        this.myDeckContainer.setMask(new Phaser.Display.Masks.GeometryMask(this, this.myDeckMask));

        // Create mask for "Global Pool"
        this.globalPoolMask = this.add.graphics();
        this.globalPoolMask.fillRect(1220, 100, 600, 800);
        this.globalPoolContainer.setMask(new Phaser.Display.Masks.GeometryMask(this, this.globalPoolMask));
    }

    handleScroll(dy: number, deck: string) {
        const scrollSpeed = 1; 
    
        if (deck === 'myDeckContainer') {
            this.myDeckContainer.y -= dy * scrollSpeed;
            const myDeckMinY = 100;
            if (this.myDeckContainer.y > myDeckMinY) {
                this.myDeckContainer.y = myDeckMinY;
            }
        } else if (deck === 'globalPoolContainer') {
            this.globalPoolContainer.y -= dy * scrollSpeed;
            const globalPoolMinY = 100;
            if (this.globalPoolContainer.y > globalPoolMinY) {
                this.globalPoolContainer.y = globalPoolMinY;
            }
        }
    }
    

}
