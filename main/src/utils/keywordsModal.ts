import { Scene } from 'phaser';

export class KeywordsModal {
    private scene: Scene;
    private modalContainer: Phaser.GameObjects.Container;
    private modalBackground: Phaser.GameObjects.Rectangle;
    private modalText: Phaser.GameObjects.Text;
    private isVisible: boolean;

    constructor(scene: Scene) {
        this.scene = scene;
        this.isVisible = false;

        // Create modal container
        this.modalContainer = this.scene.add.container(0, 0);
        this.modalBackground = this.scene.add.rectangle(0, 0, 200, 100, 0x000000, 0.8);
        this.modalText = this.scene.add.text(0, 0, '', { fontSize: '16px', color: '#ffffff', wordWrap: { width: 180 } });

        this.modalContainer.add([this.modalBackground, this.modalText]);
        this.modalContainer.setVisible(false);

        // Set up the modal close logic
        this.scene.input.on('pointerdown', this.closeModal, this);
    }

    public openModal(keyword: string, explanation: string) {
        this.modalText.setText(explanation);
        this.modalText.setOrigin(0.5, 0.5);
        this.modalContainer.setPosition(this.scene.cameras.main.centerX, this.scene.cameras.main.centerY);
        this.modalText.setPosition(0, 0); // Center text in the modal

        this.modalContainer.setVisible(true);
        this.isVisible = true;
        //TODO add a function to get the keyword text here
    }

    public closeModal() {
        if (this.isVisible) {
            this.modalContainer.setVisible(false);
            this.isVisible = false;
        }
    }
}
