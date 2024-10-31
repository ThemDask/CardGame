import { Card } from "../entities/Card";
import { resizeAndCenterImage } from "../utils/helpers/resizeAndCenterImage";

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

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);
        const TEXT_SPACING = 35;
        const TEXT_X_OFFSET = 15;
        const ICON_SIZE = 40; // Set an appropriate size for the icons

        // Background rectangle for the panel
        this.background = scene.add.rectangle(x, y, width, height, 0x000000).setOrigin(0);
        this.add(this.background);

        // Card image display area
        const imageRectWidth = width; 
        const imageRectHeight = height * 0.4;
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

        // Attribute icons and text
        const attrY = y + imageRectHeight - TEXT_SPACING;

        // Movement icon and text
        this.movementIcon = scene.add.image(TEXT_X_OFFSET, attrY, 'movement').setDisplaySize(ICON_SIZE, ICON_SIZE).setOrigin(0, 1);
        this.movementText = scene.add.text(TEXT_X_OFFSET + ICON_SIZE + 5, attrY-5, '', { font: '24px Arial', color: '#000' }).setOrigin(0, 1);

        // Damage icon and text
        this.damageIcon = scene.add.image(TEXT_X_OFFSET + imageRectWidth / 3, attrY, 'damage').setDisplaySize(ICON_SIZE, ICON_SIZE).setOrigin(0, 1);
        this.damageText = scene.add.text(TEXT_X_OFFSET + imageRectWidth / 3 + ICON_SIZE + 5, attrY-5, '', { font: '24px Arial', color: '#000' }).setOrigin(0, 1);

        // HP icon and text
        this.hpIcon = scene.add.image(TEXT_X_OFFSET + (2 * imageRectWidth) / 3, attrY, 'health').setDisplaySize(ICON_SIZE, ICON_SIZE).setOrigin(0, 1);
        this.hpText = scene.add.text(TEXT_X_OFFSET + (2 * imageRectWidth) / 3 + ICON_SIZE + 5, attrY -5, '', { font: '24px Arial', color: '#000' }).setOrigin(0, 1);

        // Ranged damage icon and text
        this.rangedDamageIcon = scene.add.image(TEXT_X_OFFSET, attrY + TEXT_SPACING, 'ranged_dmg').setDisplaySize(ICON_SIZE, ICON_SIZE).setOrigin(0, 1);
        this.rangedDamageText = scene.add.text(TEXT_X_OFFSET + ICON_SIZE + 5, attrY + TEXT_SPACING -5, '', { font: '24px Arial', color: '#000' }).setOrigin(0, 1);

        // Range icon and text
        this.rangeIcon = scene.add.image(TEXT_X_OFFSET + (1.5 * imageRectWidth) / 3, attrY + TEXT_SPACING, 'range').setDisplaySize(ICON_SIZE, ICON_SIZE).setOrigin(0, 1);
        this.rangeText = scene.add.text(TEXT_X_OFFSET + (1.5 * imageRectWidth) / 3 + ICON_SIZE + 5, attrY + TEXT_SPACING -5, '', { font: '24px Arial', color: '#000' }).setOrigin(0, 1);

        // Description and keywords rectangles positioned below the image area
        this.descriptionRect = scene.add.rectangle(x, y + imageRectHeight + 20, imageRectWidth, 100)
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0);
        this.add(this.descriptionRect);

        this.descriptionText = scene.add.text(x + 10, y + imageRectHeight + 30, '', {
            font: '16px Arial',
            color: '#fff',
            wordWrap: { width: imageRectWidth - 10 }
        }).setOrigin(0);
        this.add(this.descriptionText);

        this.keywordsRect = scene.add.rectangle(x, y + imageRectHeight + 130, imageRectWidth, 100)
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0);
        this.add(this.keywordsRect);

        this.keywordsText = scene.add.text(x + 10, y + imageRectHeight + 140, '', {
            font: '16px Arial',
            color: '#fff',
            wordWrap: { width: imageRectWidth - 10 }
        }).setOrigin(0);
        this.add(this.keywordsText);

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
}
