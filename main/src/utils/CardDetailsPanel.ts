export class CardDetailsPanel extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Rectangle;
    private cardNameText: Phaser.GameObjects.Text;
    private cardTypeText: Phaser.GameObjects.Text;
    private movementText: Phaser.GameObjects.Text;
    private damageText: Phaser.GameObjects.Text;
    private hpText: Phaser.GameObjects.Text;
    private descriptionText: Phaser.GameObjects.Text;
    private costText: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
        super(scene, x, y);

        // Create the background rectangle for the panel
        this.background = scene.add.rectangle(x, y, width, height, 0x000000).setOrigin(0);
        this.add(this.background); // Add to the container

        // Create text objects for the card details
        this.cardNameText = scene.add.text(x + 10, y + 10, '', { font: '18px Arial', color: '#fff' });
        this.cardTypeText = scene.add.text(x + 10, y + 40, '', { font: '18px Arial', color: '#fff' });
        this.movementText = scene.add.text(x + 10, y + 70, '', { font: '18px Arial', color: '#fff' });
        this.damageText = scene.add.text(x + 10, y + 100, '', { font: '18px Arial', color: '#fff' });
        this.hpText = scene.add.text(x + 10, y + 130, '', { font: '18px Arial', color: '#fff' });
        this.descriptionText = scene.add.text(x + 10, y + 160, '', { font: '18px Arial', color: '#fff', wordWrap: { width: width - 20 } });
        this.costText = scene.add.text(x + 10, y + 220, '', { font: '18px Arial', color: '#fff' });

        // Add all text objects to the container
        this.add([this.cardNameText, this.cardTypeText, this.movementText, this.damageText, this.hpText, this.descriptionText, this.costText]);

        // Add the container to the scene
        scene.add.existing(this);
    }

    // Method to update the panel with card details
    updatePanel(name: string, type: string, movement: number, damage: number, hp: number, description: string, cost: number) {
        this.cardNameText.setText(`Name: ${name}`);
        this.cardTypeText.setText(`Type: ${type}`);
        this.movementText.setText(`Movement: ${movement}`);
        this.damageText.setText(`Damage: ${damage}`);
        this.hpText.setText(`HP: ${hp}`);
        this.descriptionText.setText(`Description: ${description}`);
        this.costText.setText(`Cost: ${cost}`);
    }
}
