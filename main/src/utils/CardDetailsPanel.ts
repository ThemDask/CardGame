import { Card } from "../entities/Card";
import { resizeAndCenterImage } from "../utils/helpers/resizeAndCenterImage";

export class CardDetailsPanel extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Rectangle;
    private imageRect: Phaser.GameObjects.Rectangle;
    private cardImage: Phaser.GameObjects.Image;
    private cardNameText: Phaser.GameObjects.Text;
    private costText: Phaser.GameObjects.Text;
    private movementText: Phaser.GameObjects.Text;
    private damageText: Phaser.GameObjects.Text;
    private hpText: Phaser.GameObjects.Text;
    private rangedDamageText: Phaser.GameObjects.Text;
    private rangeText: Phaser.GameObjects.Text;
    private descriptionText: Phaser.GameObjects.Text;
    private descriptionRect: Phaser.GameObjects.Rectangle;
    private keywordsText: Phaser.GameObjects.Text;
    private keywordsRect: Phaser.GameObjects.Rectangle;
    

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        const TEXT_SPACING = 20;
        const TEXT_X_OFFSET = 15; 

        // Background rectangle for the panel
        this.background = scene.add.rectangle(x, y, width, height, 0x000000).setOrigin(0);
        this.add(this.background);

        // Card image display area
        const imageRectWidth = width; 
        const imageRectHeight = height * 0.4; // aspect ratio
        this.imageRect = scene.add.rectangle(x + 0, y + 0, imageRectWidth, imageRectHeight)
            .setStrokeStyle(2, 0xffffff).setOrigin(0);
        this.add(this.imageRect);

        // Card image
        this.cardImage = scene.add.image(this.imageRect.getCenter().x, this.imageRect.getCenter().y, '')
            .setDisplaySize(imageRectWidth, imageRectHeight) 
            .setOrigin(0.5, 0.5); // Center the image within the rectangle
        this.add(this.cardImage);

        // Card name and cost
        this.cardNameText = scene.add.text(x + 7, y + 7, '', { font: '18px Arial', color: '#000' }).setOrigin(0, 0);
        this.costText = scene.add.text(x + width - 7, y + 7, '', { font: '18px Arial', color: '#000' }).setOrigin(1, 0);

        // First row of attribute texts at the bottom of the card image
        const attrY = y + imageRectHeight - TEXT_SPACING;
        this.movementText = scene.add.text(TEXT_X_OFFSET, attrY, '', { font: '18px Arial', color: '#000' }).setOrigin(0, 1);
        this.damageText = scene.add.text(TEXT_X_OFFSET + imageRectWidth / 3, attrY, '', { font: '18px Arial', color: '#000' }).setOrigin(0, 1);
        this.hpText = scene.add.text(TEXT_X_OFFSET + (2 * imageRectWidth) / 3, attrY, '', { font: '18px Arial', color: '#000' }).setOrigin(0, 1);

        // Second row of texts
        this.rangedDamageText = scene.add.text(TEXT_X_OFFSET, attrY + TEXT_SPACING, '', { font: '18px Arial', color: '#000' }).setOrigin(0, 1);
        this.rangeText = scene.add.text(TEXT_X_OFFSET + (1.5 * imageRectWidth) / 3, attrY + TEXT_SPACING, '', { font: '18px Arial', color: '#000' }).setOrigin(0, 1);

        // Description and keywords rectangles positioned below the image area
        this.descriptionRect = scene.add.rectangle(x , y + imageRectHeight + 20, imageRectWidth, 100)
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0);
        this.add(this.descriptionRect);

        this.descriptionText = scene.add.text(x + 10, y + imageRectHeight + 30, '', {
            font: '16px Arial',
            color: '#fff',
            wordWrap: { width: imageRectWidth - 10 }
        }).setOrigin(0);
        this.add(this.descriptionText);

        this.keywordsRect = scene.add.rectangle(x , y + imageRectHeight + 130, imageRectWidth, 100)
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0);
        this.add(this.keywordsRect);

        this.keywordsText = scene.add.text(x + 10, y + imageRectHeight + 140, '', {
            font: '16px Arial',
            color: '#fff',
            wordWrap: { width: imageRectWidth - 10 }
        }).setOrigin(0);
        this.add(this.keywordsText);

        // Add elements to the container
        this.add([this.cardNameText, this.costText, this.movementText, this.damageText, this.hpText, this.rangedDamageText, this.rangeText, this.descriptionText, this.keywordsText]);
        
        scene.add.existing(this);
    }

    // Method to update panel details based on the selected card
    updatePanel(card: Card | null) {
        if (card) {
            this.cardNameText.setText(`${card.name}`);
            this.costText.setText(`Cost: ${card.cost}`);
            this.cardImage.setTexture(card.imagePath);

            // Create a bounding box using the imageRect properties
            const boundingBox = new Phaser.Geom.Rectangle(
                this.imageRect.x,
                this.imageRect.y,
                this.imageRect.width,
                this.imageRect.height
            );

            // Helper method to resize and center the image
            resizeAndCenterImage(this.cardImage, boundingBox);

            this.movementText.setText(`Move: ${card.movement}`);
            this.damageText.setText(`Damage: ${card.damage}`);
            this.hpText.setText(`HP: ${card.hp}`);
            this.rangedDamageText.setText(`Ranged dmg: ${card.ranged_damage}`);
            this.rangeText.setText(`Range: ${card.range}`);
            this.descriptionText.setText(card.description);
            this.keywordsText.setText(card.keywords);
        } else {
            // Reset all fields to placeholders if card is null
            this.cardNameText.setText('Name: -');
            this.costText.setText('Cost: 0');
            this.cardImage.setTexture('placeholder');

            const boundingBox = new Phaser.Geom.Rectangle(
                this.imageRect.x,
                this.imageRect.y,
                this.imageRect.width,
                this.imageRect.height
            );

            resizeAndCenterImage(this.cardImage, boundingBox);

            this.movementText.setText('Move: 0');
            this.damageText.setText('Damage: 0');
            this.hpText.setText('HP: 0');
            this.rangedDamageText.setText('-');
            this.rangeText.setText('-');
            this.descriptionText.setText('-');
            this.keywordsText.setText('-');
        }
    }
}
    
