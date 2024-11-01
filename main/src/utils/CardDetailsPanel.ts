import { Card } from "../entities/Card";
import { resizeAndCenterImage } from "../utils/helpers/resizeAndCenterImage";
import { KeywordDirectory } from "./keywordDirectory";
import { KeywordsModal } from "./keywordsModal";

export class CardDetailsPanel extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Rectangle;
    private imageRect: Phaser.GameObjects.Rectangle;
    private cardImage: Phaser.GameObjects.Image;
    private cardNameText: Phaser.GameObjects.Text;
    private costText: Phaser.GameObjects.Text;
    private movementText: Phaser.GameObjects.Text;
    private movementIcon: Phaser.GameObjects.Image;
    private damageText: Phaser.GameObjects.Text;
    private damageIcon: Phaser.GameObjects.Image;
    private hpText: Phaser.GameObjects.Text;
    private hpIcon: Phaser.GameObjects.Image;
    private rangedDamageText: Phaser.GameObjects.Text;
    private rangedDamageIcon: Phaser.GameObjects.Image;
    private rangeText: Phaser.GameObjects.Text;
    private rangeIcon: Phaser.GameObjects.Image;
    private descriptionText: Phaser.GameObjects.Text;
    private descriptionRect: Phaser.GameObjects.Rectangle;
    private keywordsText: Phaser.GameObjects.Text;
    private keywordsRect: Phaser.GameObjects.Rectangle;
    private keywordsModal: KeywordsModal;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        const TEXT_X_OFFSET = 15;
        const ICON_SIZE = 60; // Set an appropriate size for the icons
        const GAP_BETWEEN_ICONS = 30; // Space between each icon-text pair

        // Background rectangle for the panel
        this.background = scene.add.rectangle(x, y, width, height, 0x000000).setOrigin(0);
        this.add(this.background);

        // Card image display area
        const imageRectWidth = width;
        const imageRectHeight = width * 0.93;
        this.imageRect = scene.add.rectangle(x, y, imageRectWidth, imageRectHeight)
            .setStrokeStyle(2, 0xffffff).setOrigin(0);
        this.add(this.imageRect);

        // Card image
        this.cardImage = scene.add.image(this.imageRect.getCenter().x, this.imageRect.getCenter().y, '')
            .setDisplaySize(imageRectWidth, imageRectHeight)
            .setOrigin(0.5, 0.5);
        this.add(this.cardImage);

        // Card name and cost
        this.cardNameText = scene.add.text(x + 7, y + 7, '', { font: '24px Arial', color: '#000' }).setOrigin(0, 0);
        this.costText = scene.add.text(x + width - 7, y + 7, '', { font: '24px Arial', color: '#000' }).setOrigin(1, 0);

        // Row position for icons and texts
        const ROW_Y = y + imageRectHeight; // Adjust as needed based on layout

        // Position for each icon and text
        let currentX = x + TEXT_X_OFFSET;

        // Movement icon and text
        this.movementIcon = scene.add.image(currentX, ROW_Y, 'movement')
            .setDisplaySize(ICON_SIZE, ICON_SIZE).setOrigin(0, 1);
        this.movementText = scene.add.text(currentX + ICON_SIZE + 5, ROW_Y - 10, '',
            { font: '30px Arial', color: '#000' }).setOrigin(0, 1);
        currentX += ICON_SIZE + GAP_BETWEEN_ICONS;

        // Damage icon and text
        this.damageIcon = scene.add.image(currentX, ROW_Y, 'damage')
            .setDisplaySize(ICON_SIZE, ICON_SIZE).setOrigin(0, 1);
        this.damageText = scene.add.text(currentX + ICON_SIZE + 5, ROW_Y - 10, '',
            { font: '30px Arial', color: '#000' }).setOrigin(0, 1);
        currentX += ICON_SIZE + GAP_BETWEEN_ICONS;

        // HP icon and text
        this.hpIcon = scene.add.image(currentX, ROW_Y, 'health')
            .setDisplaySize(ICON_SIZE, ICON_SIZE).setOrigin(0, 1);
        this.hpText = scene.add.text(currentX + ICON_SIZE + 5, ROW_Y - 10, '',
            { font: '30px Arial', color: '#000' }).setOrigin(0, 1);
        currentX += ICON_SIZE + GAP_BETWEEN_ICONS;

        // Ranged damage icon and text
        this.rangedDamageIcon = scene.add.image(currentX, ROW_Y, 'ranged_dmg')
            .setDisplaySize(ICON_SIZE, ICON_SIZE).setOrigin(0, 1);
        this.rangedDamageText = scene.add.text(currentX + ICON_SIZE + 5, ROW_Y - 10, '',
            { font: '30px Arial', color: '#000' }).setOrigin(0, 1);
        currentX += ICON_SIZE + GAP_BETWEEN_ICONS;

        // Range icon and text
        this.rangeIcon = scene.add.image(currentX, ROW_Y, 'range')
            .setDisplaySize(ICON_SIZE, ICON_SIZE).setOrigin(0, 1);
        this.rangeText = scene.add.text(currentX + ICON_SIZE + 5, ROW_Y - 10, '',
            { font: '30px Arial', color: '#000' }).setOrigin(0, 1);

        // Description and keywords rectangles positioned below the image area
        this.descriptionRect = scene.add.rectangle(x, y + imageRectHeight + 20, imageRectWidth, 100)
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0);
        this.add(this.descriptionRect);

        this.descriptionText = scene.add.text(x + 10, y + imageRectHeight + 30, '', {
            font: '22px Arial',
            color: '#fff',
            wordWrap: { width: imageRectWidth - 10 }
        }).setOrigin(0);
        this.add(this.descriptionText);

        this.keywordsRect = scene.add.rectangle(x, y + imageRectHeight + 130, imageRectWidth, 100)
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0);
        this.add(this.keywordsRect);

        this.keywordsText = scene.add.text(x + 10, y + imageRectHeight + 140, '', {
            font: '22px Arial',
            color: '#fff',
            wordWrap: { width: imageRectWidth - 10 }
        }).setOrigin(0);
        this.add(this.keywordsText);

        //keywords modal setup
        this.keywordsModal = new KeywordsModal(scene);
        this.setupKeywordsInteraction();

        // Add all elements to the container
        this.add([this.cardNameText, this.costText, this.movementIcon, this.movementText, this.damageIcon, this.damageText, this.hpIcon, this.hpText, this.rangedDamageIcon, this.rangedDamageText, this.rangeIcon, this.rangeText, this.descriptionText, this.keywordsText]);

        scene.add.existing(this);
    }

    // Method to update panel details based on the selected card
    updatePanel(card: Card | null) {
        if (card) {
            this.cardNameText.setText(`${card.name}`);
            this.costText.setText(`Cost: ${card.cost}`);
            this.cardImage.setTexture(card.imagePath);

            const boundingBox = new Phaser.Geom.Rectangle(
                this.imageRect.x,
                this.imageRect.y,
                this.imageRect.width,
                this.imageRect.height
            );

            resizeAndCenterImage(this.cardImage, boundingBox);

            this.movementText.setText(`${card.movement}`);
            this.damageText.setText(`${card.damage}`);
            this.hpText.setText(`${card.hp}`);
            this.rangedDamageText.setText(`${card.ranged_damage}`);
            this.rangeText.setText(`${card.range}`);
            this.descriptionText.setText(card.description);
            this.keywordsText.setText(card.keywords);
        } else {
            // Reset fields to placeholders if no card is selected
            this.cardNameText.setText('Name: -');
            this.costText.setText('Cost: 0');
            this.cardImage.setTexture('placeholder');

            resizeAndCenterImage(this.cardImage, new Phaser.Geom.Rectangle(
                this.imageRect.x,
                this.imageRect.y,
                this.imageRect.width,
                this.imageRect.height
            ));

            this.movementText.setText('0');
            this.damageText.setText('0');
            this.hpText.setText('0');
            this.rangedDamageText.setText('-');
            this.rangeText.setText('-');
            this.descriptionText.setText('-');
            this.keywordsText.setText('-');
        }
    }

    private setupKeywordsInteraction() {
        // Add click event listener to keywordsText
        this.keywordsText.setInteractive();
        this.keywordsText.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const clickedKeyword = this.getClickedKeyword(pointer);
            if (clickedKeyword) {
                const explanation = KeywordDirectory[clickedKeyword];
                this.keywordsModal.openModal(clickedKeyword, explanation);
            }
        });
    }

    private getClickedKeyword(pointer: Phaser.Input.Pointer): string | null {
        const text = this.keywordsText.text.split(', ');
        const keywordWidths: number[] = [];

        // Calculate widths of each keyword
        for (const keyword of text) {
            const tempText = this.keywordsText.scene.add.text(0, 0, keyword, this.keywordsText.style);
            keywordWidths.push(tempText.getBounds().width);
            tempText.destroy(); // Clean up temporary text object
        }

        // Determine if a keyword was clicked based on pointer position
        let currentX = this.keywordsText.x;
        for (let i = 0; i < text.length; i++) {
            const keywordWidth = keywordWidths[i];
            if (pointer.x >= currentX && pointer.x <= currentX + keywordWidth &&
                pointer.y >= this.keywordsText.y && pointer.y <= this.keywordsText.y + this.keywordsText.getBounds().height) {
                return text[i];
            }
            currentX += keywordWidth; // Move to the next keyword's starting position
        }
        return null; // No keyword clicked
    }
}
