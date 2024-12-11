import { DeckBuilderScene } from "../scenes/DeckBuilderScene";

export class SearchBox {
    private keywordContainer: Phaser.GameObjects.Container;
    private keywordFilters: Set<string> = new Set();
    private scene: Phaser.Scene;
    private inputField: Phaser.GameObjects.DOMElement;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;

        // Create container for search box UI
        const container = scene.add.container(x, y);

        // Create the keyword container for keyword buttons
        this.keywordContainer = scene.add.container(0, 50);
        container.add(this.keywordContainer);

        // Create the DOM input field for search
        const inputHTML = `
        <input 
            type="text" 
            id="search-box" 
            style="
            width: 250px; 
            height: 24px; 
            border: 2px solid white; 
            border-radius: 4px; 
            padding: 4px; 
            font-size: 14px; 
            color: white; /* Text color */
            background-color: black; /* Background color */
            "
            placeholder="Search Cards..."
        />`;

        this.inputField = this.scene.add.dom(x+130, y).createFromHTML(inputHTML);

        // Add input event listener
        const inputElement = this.inputField.getChildByID('search-box') as HTMLInputElement;
        if (inputElement) {
            inputElement.addEventListener('input', () => {
                const searchTerm = inputElement.value.toLowerCase();
                this.notifySearchChange(searchTerm, this.keywordFilters);
            });
        }

        // Create the keyword filters
        this.createKeywordFilters(scene);
    }

    private createKeywordFilters(scene: Phaser.Scene) {
        // Cast the scene to DeckBuilderScene to access globalPool
        const deckBuilderScene = scene as DeckBuilderScene;

        // Grouped keywords by name
        const groupedKeywords: Record<string, Set<string>> = {};

        // Collect unique keywords from globalPool and group them by base name
        deckBuilderScene.globalPool.forEach((card: any) => {
            card.keywords.forEach((keyword: string) => {
                const keywordBase = keyword.replace(/\d+/g, '').trim(); // Group by base name, ignoring numbers
                if (!groupedKeywords[keywordBase]) {
                    groupedKeywords[keywordBase] = new Set<string>();
                }
                groupedKeywords[keywordBase].add(keyword);
            });
        });

        let row = 0;
        let col = 0;

        // Create buttons for each unique grouped keyword
        Object.keys(groupedKeywords).forEach((keywordBase) => {
            const keywordButton = scene.add.text(col * 140, row * 50, keywordBase, {
                font: '20px Arial',
                color: '#ffffff',
                backgroundColor: '#3da968',
                padding: { left: 10, right: 10, top: 5, bottom: 5 },
            }).setInteractive();

            keywordButton.on('pointerdown', () => {
                // Toggle the keyword filter on or off
                if (this.keywordFilters.has(keywordBase)) {
                    this.keywordFilters.delete(keywordBase);
                    keywordButton.setStyle({ backgroundColor: '#3da968' });
                } else {
                    this.keywordFilters.add(keywordBase);
                    keywordButton.setStyle({ backgroundColor: '#7fffb2' });
                }

                // Notify scene about the filter change
                const searchTerm = (this.inputField.getChildByID('search-box') as HTMLInputElement)?.value.toLowerCase() || "";
                this.notifySearchChange(searchTerm, this.keywordFilters);
            });

            this.keywordContainer.add(keywordButton);
            col++;
            if (col >= 3) {
                col = 0;
                row++;
            }
        });
    }

    private notifySearchChange(searchTerm: string, activeFilters: Set<string>) {
        // Notify scene to update the filtered cards
        this.scene.events.emit('searchChange', searchTerm, activeFilters);
    }
}
