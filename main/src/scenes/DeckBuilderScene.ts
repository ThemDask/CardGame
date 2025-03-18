import Phaser from 'phaser';
import { Card } from '../entities/Card';
import { CardDetailsPanel } from '../utils/CardDetailsPanel';
import { createGlobalCardPool } from '../utils/helpers/createGlobalCardPool';
import cardData from '../../../public/cardData.json';
import { createBackButton } from '../utils/helpers/backButton';
import { GameStateManager } from '../state/GameStateManager';
import { SearchBox } from '../utils/SearchBox';
import { extractKeywordBase } from '../utils/helpers/extractKeywordBase';

export class DeckBuilderScene extends Phaser.Scene {
    private gold: number;
    private myDeck: Card[];
    public globalPool: Card[];
    private myDeckContainer: Phaser.GameObjects.Container;
    private globalPoolContainer: Phaser.GameObjects.Container;
    private cardDetailsPanel: CardDetailsPanel;
    private myDeckMask: Phaser.GameObjects.Graphics;
    private globalPoolMask: Phaser.GameObjects.Graphics;
    private importDeckButtonRect: Phaser.GameObjects.Rectangle;
    private useDeckButtonRect: Phaser.GameObjects.Rectangle;
    private exportDeckButtonRect: Phaser.GameObjects.Rectangle;
    private importDeckButtonText: Phaser.GameObjects.Text;
    private exportDeckButtonText: Phaser.GameObjects.Text;
    private useDeckButtonText: Phaser.GameObjects.Text;
    private filteredCards: Card[] = [];

    constructor() {
        super({ key: 'DeckBuilderScene' });
        this.gold = 100; 
        this.myDeck = []; 
        this.globalPool = createGlobalCardPool(true); 
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

        this.input.keyboard?.on('keydown-ESC', () => {
            if (!this.scene.isActive('EscapeMenu')) {
                this.scene.launch('EscapeMenu');
            }
        });
        
        this.cardDetailsPanel = new CardDetailsPanel(this, 5, 5, 500, 700); 
        this.cardDetailsPanel.updatePanel(null);

        this.createDeckRectangles();

        this.add.text(1200, 50, `🪙: ${this.gold}`, { font: '32px Arial', color: '#ffffff' });

        const searchBox = new SearchBox(this, 50, 770);

        this.events.on('searchChange', (searchTerm: string, activeFilters: Set<string>) => {
            console.log("sds")
            this.updateFilteredCards(searchTerm, activeFilters);
        });

        this.filteredCards = this.globalPool;

        this.myDeckContainer = this.add.container(610, 105);
        this.globalPoolContainer = this.add.container(1360, 105);
        
        // Display decks within containers
        this.displayDeck(this.myDeck, this.myDeckContainer); 
        this.displayDeck(this.filteredCards, this.globalPoolContainer);

        // Add mask for scrolling areas
        this.createScrollingMasks();

        // add save/load/download deck buttons
        this.createDeckButtons();

        createBackButton(this);
    }

    createDeckRectangles() {
        const myDeckRect = this.add.rectangle(600, 100, 560, 810).setStrokeStyle(5, 0xffffff).setOrigin(0);
        const globalPoolRect = this.add.rectangle(1350, 100, 560, 810).setStrokeStyle(5, 0xffffff).setOrigin(0);

        this.add.text(600, 50, 'My Deck', { font: '32px Arial', color: '#ffffff' });
        this.add.text(1400, 50, 'Global Pool', { font: '32px Arial', color: '#ffffff' });
    
        // Input handling for scroll
        this.input.on('wheel', (pointer: Phaser.Input.Pointer, _currentlyOver: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
            let selectedDeck = null;
    
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

    displayDeck(cards: Card[], container: Phaser.GameObjects.Container) {
        const slotWidth = 100;
        const slotHeight = 120;
        const marginX = 10;
        const marginY = 20;
        const slotsPerRow = 5;
    
        for (let i = 0; i < 100; i++) {
            const row = Math.floor(i / slotsPerRow);
            const col = i % slotsPerRow;
    
            const slotX = col * (slotWidth + marginX);
            const slotY = row * (slotHeight + marginY);
    
            const slotBackground = this.add.rectangle(slotX, slotY, slotWidth, slotHeight).setStrokeStyle(2, 0xffffff).setOrigin(0);
            container.add(slotBackground);
    
            // Add card image if within deck limit
            if (i < cards.length) {
                const card = cards[i];
                const cardImage = this.add.image(slotX + slotWidth / 2, slotY + slotHeight / 2, card.imagePath).setDisplaySize(slotWidth, slotHeight);
                container.add(cardImage);
    
                // Enable card interaction
                cardImage.setInteractive();
                cardImage.on('pointerdown', () => {
                    this.handleCardClick(card, container === this.myDeckContainer);
                });
    
                // Display card gold value
                const goldText = this.add.text(slotX + 10, slotY + 10, `${card.cost}`, { font: '18px Arial', color: '#000' });
                container.add(goldText); 
    
                cardImage.on('pointerover', () => {
                    this.cardDetailsPanel.updatePanel(card);
                    slotBackground.setStrokeStyle(5, 0x00cc00); // Increase border thickness and change color
                });
    
                cardImage.on('pointerout', () => {
                    this.cardDetailsPanel.updatePanel(null);
                    slotBackground.setStrokeStyle(2, 0xffffff); // Reset border thickness and color
                });
            }
        }
    }
    
    createDeckButtons() {
        this.importDeckButtonRect = this.add.rectangle(600, 950, 120, 50).setStrokeStyle(3, 0xffffff).setOrigin(0);
        this.exportDeckButtonRect = this.add.rectangle(740, 950, 120, 50).setStrokeStyle(3, 0xffffff).setOrigin(0);
        this.useDeckButtonRect = this.add.rectangle(1040, 950, 120, 50).setStrokeStyle(3, 0xffffff).setOrigin(0);
    
        this.importDeckButtonText = this.add.text(this.importDeckButtonRect.getCenter().x, this.importDeckButtonRect.getCenter().y, 'Import Deck', { font: '20px Arial', color: '#fff' }).setOrigin(0.5);
        this.exportDeckButtonText = this.add.text(this.exportDeckButtonRect.getCenter().x, this.exportDeckButtonRect.getCenter().y, 'Export Deck', { font: '20px Arial', color: '#fff' }).setOrigin(0.5);
        this.useDeckButtonText = this.add.text(this.useDeckButtonRect.getCenter().x, this.useDeckButtonRect.getCenter().y, 'Use Deck', { font: '20px Arial', color: '#fff' }).setOrigin(0.5);
    
        this.importDeckButtonRect.setInteractive();
        this.exportDeckButtonRect.setInteractive();
        this.useDeckButtonRect.setInteractive();
    
        this.useDeckButtonRect.on('pointerdown', () => {
            this.useDeckButtonRect.setFillStyle(0x7fffb2);
            this.useDeck();
        });
    
        this.importDeckButtonRect.on('pointerdown', () => {
            this.importDeckButtonRect.setFillStyle(0x7fffb2);
            this.loadDeck();
        });
    
        this.exportDeckButtonRect.on('pointerdown', () => {
            this.exportDeckButtonRect.setFillStyle(0x7fffb2);
            this.saveDeck();
        });
    
        this.useDeckButtonRect.on('pointerup', () => {
            this.useDeckButtonRect.setFillStyle(0x000000);
        });
    
        this.importDeckButtonRect.on('pointerup', () => {
            this.importDeckButtonRect.setFillStyle(0x000000);
        });
    
        this.exportDeckButtonRect.on('pointerup', () => {
            this.exportDeckButtonRect.setFillStyle(0x000000);
        });
    
        this.useDeckButtonRect.on('pointerover', () => {
            this.useDeckButtonRect.setFillStyle(0x7fffb2);
        });
    
        this.importDeckButtonRect.on('pointerover', () => {
            this.importDeckButtonRect.setFillStyle(0x7fffb2);
        });
    
        this.exportDeckButtonRect.on('pointerover', () => {
            this.exportDeckButtonRect.setFillStyle(0x7fffb2);
        });
    
        this.useDeckButtonRect.on('pointerout', () => {
            this.useDeckButtonRect.setFillStyle(0x000000);
        });
    
        this.importDeckButtonRect.on('pointerout', () => {
            this.importDeckButtonRect.setFillStyle(0x000000);
        });
    
        this.exportDeckButtonRect.on('pointerout', () => {
            this.exportDeckButtonRect.setFillStyle(0x000000);
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

    private useDeck(): void {
        const deckIds = this.myDeck.map(card => card.id);
        GameStateManager.getInstance().setSelectedDeck(deckIds);
    
        this.add.text(1250, 975, "Deck Selected!", { font: "20px Arial", color: "#00ff00" }).setOrigin(0.5);
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
        this.myDeckMask = this.add.graphics();
        this.myDeckMask.fillRect(this.myDeckContainer.x, this.myDeckContainer.y, 600, 800);
        this.myDeckContainer.setMask(new Phaser.Display.Masks.GeometryMask(this, this.myDeckMask));

        this.globalPoolMask = this.add.graphics();
        this.globalPoolMask.fillRect(this.globalPoolContainer.x, this.globalPoolContainer.y, 600, 800);
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


    private updateFilteredCards(searchTerm: string, activeFilters: Set<string>) {
        // Check if the search term is still the default placeholder ('Search...')
        if (searchTerm === 'Search...') {
            searchTerm = ''; // Treat it as an empty string for filtering purposes
        }
    
        // If searchTerm is empty, only apply the active keyword filters
        if (searchTerm.trim() === "") {
            this.filteredCards = this.globalPool.filter(card => {
                // Check if card matches any of the active keyword filters
                const keywordMatches =
                    activeFilters.size === 0 || 
                    (card.keywords && card.keywords.some(keyword => activeFilters.has(extractKeywordBase(keyword))));
    
                return keywordMatches;
            });
        } else {
            // Apply both search and keyword filters
            this.filteredCards = this.globalPool.filter(card => {
                const nameMatches = card.name.toLowerCase().includes(searchTerm.toLowerCase());
    
                // Keyword matching (include cards with no keywords)
                const keywordMatches =
                    card.keywords.length === 0 ||
                    activeFilters.size === 0 ||
                    card.keywords.some(keyword => activeFilters.has(extractKeywordBase(keyword)));
    
                return nameMatches && keywordMatches;
            });
        }
        this.updateGlobalPool();
    }
    
    

    
    private updateGlobalPool() {
        this.globalPoolContainer.removeAll(true); // Clear existing cards
        this.displayDeck(this.filteredCards, this.globalPoolContainer); // Display the filtered cards
    }
    
    
    
}
