import { Card } from "../entities/Card";
import { resizeAndCenterImage } from "../utils/helpers/resizeAndCenterImage";

//TODO display all Card properties
export class CardDetailsPanel extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Rectangle;
    private cardImage: Phaser.GameObjects.Image;
    private cardNameText: Phaser.GameObjects.Text;
    private costText: Phaser.GameObjects.Text;
    private movementRect: Phaser.GameObjects.Rectangle;
    private damageRect: Phaser.GameObjects.Rectangle;
    private hpRect: Phaser.GameObjects.Rectangle;
    private movementText: Phaser.GameObjects.Text;
    private damageText: Phaser.GameObjects.Text;
    private hpText: Phaser.GameObjects.Text;
    private descriptionRect: Phaser.GameObjects.Rectangle;
    private descriptionText: Phaser.GameObjects.Text;
    private keywordsRect: Phaser.GameObjects.Rectangle;
    private keywordsText: Phaser.GameObjects.Text;
    private rangedDamageRect: Phaser.GameObjects.Rectangle;
    private rangedDamageText: Phaser.GameObjects.Text;
    private rangeRect: Phaser.GameObjects.Rectangle;
    private rangeText: Phaser.GameObjects.Text;
    private imageRect: Phaser.GameObjects.Rectangle; 

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);

        // Create the background rectangle for the panel
        this.background = scene.add.rectangle(x, y, width, height, 0x000000).setOrigin(0);
        this.add(this.background); // Add to the container

        // Rectangle and image for the card image display
        const imageRectWidth = width - 20;
        const imageRectHeight = imageRectWidth * 1.4; 

        this.imageRect = scene.add.rectangle(x + 10, y + 10, imageRectWidth, imageRectHeight).setStrokeStyle(2, 0xffffff).setOrigin(0);
        this.add(this.imageRect);

        this.cardImage = scene.add.image(this.imageRect.getCenter().x, this.imageRect.getCenter().y, '').setDisplaySize(imageRectWidth, imageRectHeight).setOrigin(0.5);
        this.add(this.cardImage);

        this.cardNameText = scene.add.text(x + 15, y + 15, '', { font: '18px Arial', color: '#fff' }).setOrigin(0, 0);
        this.costText = scene.add.text(x + width - 15, y + 15, '', { font: '18px Arial', color: '#fff' }).setOrigin(1, 0);
 
        // Create rectangles and text for movement, damage, hp, description
        this.movementRect = scene.add.rectangle(x + 10, y + imageRectHeight + 30, imageRectWidth / 3 - 5, 40).setStrokeStyle(2, 0xffffff).setOrigin(0);
        this.movementText = scene.add.text(this.movementRect.getCenter().x, this.movementRect.getCenter().y, '', { font: '16px Arial', color: '#fff' }).setOrigin(0.5);
        this.add(this.movementRect);
        this.add(this.movementText);

        this.damageRect = scene.add.rectangle(x + 15 + imageRectWidth / 3, y + imageRectHeight + 30, imageRectWidth / 3 - 5, 40).setStrokeStyle(2, 0xffffff).setOrigin(0);
        this.damageText = scene.add.text(this.damageRect.getCenter().x, this.damageRect.getCenter().y, '', { font: '16px Arial', color: '#fff' }).setOrigin(0.5);
        this.add(this.damageRect);
        this.add(this.damageText);

        this.hpRect = scene.add.rectangle(x + 20 + 2 * (imageRectWidth / 3), y + imageRectHeight + 30, imageRectWidth / 3 - 5, 40).setStrokeStyle(2, 0xffffff).setOrigin(0);
        this.hpText = scene.add.text(this.hpRect.getCenter().x, this.hpRect.getCenter().y, '', { font: '16px Arial', color: '#fff' }).setOrigin(0.5);
        this.add(this.hpRect);
        this.add(this.hpText);

        this.rangedDamageRect = scene.add.rectangle(x - 80 +imageRectWidth / 2, y + imageRectHeight + 80, imageRectWidth / 3 - 5, 40).setStrokeStyle(2, 0xffffff).setOrigin(0);
        this.rangedDamageText = scene.add.text(this.rangedDamageRect.getCenter().x, this.rangedDamageRect.getCenter().y, '', { font: '12px Arial', color: '#fff' }).setOrigin(0.5);
        this.add(this.rangedDamageRect);
        this.add(this.rangedDamageText);

        this.rangeRect = scene.add.rectangle(x - 120 + 2 * (imageRectWidth / 2), y + imageRectHeight + 80, imageRectWidth / 3 - 5, 40).setStrokeStyle(2, 0xffffff).setOrigin(0);
        this.rangeText = scene.add.text(this.rangeRect.getCenter().x, this.rangeRect.getCenter().y, '', { font: '16px Arial', color: '#fff' }).setOrigin(0.5);
        this.add(this.rangeRect);
        this.add(this.rangeText);

        this.descriptionRect = scene.add.rectangle(x + 10, y + imageRectHeight + 130, imageRectWidth, 100).setStrokeStyle(2, 0xffffff).setOrigin(0);
        this.add(this.descriptionRect);

        this.descriptionText = scene.add.text(x + 15, y + imageRectHeight + 135, '', { font: '16px Arial', color: '#fff', wordWrap: { width: imageRectWidth - 10 } }).setOrigin(0);
        this.add(this.descriptionText);

        this.keywordsRect = scene.add.rectangle(x + 10, y + imageRectHeight + 250, imageRectWidth, 100).setStrokeStyle(2, 0xffffff).setOrigin(0);
        this.add(this.keywordsRect);

        this.keywordsText = scene.add.text(x + 15, y + imageRectHeight + 255, '', { font: '16px Arial', color: '#fff', wordWrap: { width: imageRectWidth - 10 } }).setOrigin(0);
        this.add(this.keywordsText);

        this.add([this.cardNameText, this.costText]);

        // Add the container to the scene
        scene.add.existing(this);
    }

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
    
            // Call helper method to resize and center the image within the bounding box
            resizeAndCenterImage(this.cardImage, boundingBox);
    
            this.movementText.setText(`Move: ${card.movement}`);
            this.damageText.setText(`Damage: ${card.damage}`);
            this.hpText.setText(`HP: ${card.hp}`);
            this.descriptionText.setText(card.description);
            this.keywordsText.setText(card.keywords);
            this.rangedDamageText.setText(`Ranged dmg: ${card.ranged_damage}`);
            this.rangeText.setText(`Range: ${card.range}`);
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
    
            // Call the new method for the placeholder image
            resizeAndCenterImage(this.cardImage, boundingBox);
    
            this.movementText.setText('Move: 0');
            this.damageText.setText('Damage: 0');
            this.hpText.setText('HP: 0');
            this.descriptionText.setText('-');
            this.keywordsText.setText('-');
            this.rangedDamageText.setText('-');
            this.rangeText.setText('-');
        }
    }

    // TODO
    createRectanglesAndText() {

    }

}
