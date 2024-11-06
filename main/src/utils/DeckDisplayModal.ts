import Phaser from 'phaser';
import { Card } from '../entities/Card';  // Adjust path as necessary

export class DeckDisplayModal {
    private scene: Phaser.Scene;
    public container: Phaser.GameObjects.Container;
    public overlay: Phaser.GameObjects.Rectangle;
    private scrollMask: Phaser.GameObjects.Graphics;
    private deckContainer: Phaser.GameObjects.Container;
    private slots: Phaser.GameObjects.Rectangle[] = [];

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        this.scene = scene;

        // Overlay setup
        this.overlay = this.scene.add.rectangle(0, 0, this.scene.scale.width, this.scene.scale.height, 0x000000, 0.5)
            .setOrigin(0).setInteractive().setVisible(false).on('pointerdown', () => this.close());

        // Container setup
        this.container = this.scene.add.container(x, y).setVisible(false);
        const background = this.scene.add.rectangle(0, 0, width, height, 0x000000).setOrigin(0).setStrokeStyle(2, 0xffffff);
        this.container.add(background);

        // Deck container for slots
        this.deckContainer = this.scene.add.container(10, 10); // Positioned inside modal
        this.container.add(this.deckContainer);

        // Create slots and scrolling mask
        this.createSlots();
        this.createScrollMask(width, height);

        // Handle scroll input
        this.scene.input.on('wheel', (pointer: Phaser.Input.Pointer, _currentlyOver: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
            this.handleScroll(dy);
        });
    }

    private createSlots() {
        const slotWidth = 100;
        const slotHeight = 120;
        const marginX = 10;
        const marginY = 20;
        const slotsPerRow = 5;
        const totalSlots = 100;

        for (let i = 0; i < totalSlots; i++) {
            const row = Math.floor(i / slotsPerRow);
            const col = i % slotsPerRow;

            const slotX = col * (slotWidth + marginX);
            const slotY = row * (slotHeight + marginY);

            const slotBackground = this.scene.add.rectangle(slotX, slotY, slotWidth, slotHeight)
                .setStrokeStyle(2, 0xffffff)
                .setOrigin(0);

            this.deckContainer.add(slotBackground);
            this.slots.push(slotBackground);
        }
    }

    private createScrollMask(width: number, height: number) {
        this.scrollMask = this.scene.add.graphics();
        this.scrollMask.fillRect(10, 10, width - 20, height - 20);
        this.deckContainer.setMask(new Phaser.Display.Masks.GeometryMask(this.scene, this.scrollMask));
    }

    private handleScroll(dy: number) {
        const scrollSpeed = 1;
        this.deckContainer.y -= dy * scrollSpeed;

        // Set limits for scrolling to avoid empty space
        const minY = 10;
        const maxY = -((this.slots.length / 5) * (120 + 20) - 780); // Adjust for slot height and margin
        if (this.deckContainer.y > minY) {
            this.deckContainer.y = minY;
        } else if (this.deckContainer.y < maxY) {
            this.deckContainer.y = maxY;
        }
    }

    open() {
        this.overlay.setVisible(true);
        this.container.setVisible(true);
    }

    close() {
        this.overlay.setVisible(false);
        this.container.setVisible(false);
    }

    toggle() {
        if (this.container.visible) {
            this.close();
        } else {
            this.open();
        }
    }
}

// export default DeckDisplayModal;
