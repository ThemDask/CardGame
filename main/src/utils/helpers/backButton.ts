import { buttonOutStroke, buttonOutStyle, buttonOverStroke, buttonOverStyle, buttonUpStroke, buttonUpStyle } from "../styles";

export function createBackButton(scene: Phaser.Scene) {
    if (scene.scene.key == 'DeckBuilderScene') {
        const backButton = scene.add.text(1770, 960, 'Back', { fontSize: '36px', color: '#ffffff', strokeThickness: 2 })
        .setInteractive()
        .on('pointerdown', () => {
                scene.scene.stop(scene);
                scene.scene.start('MenuScene');
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
    else if (scene.scene.key =="UIScene" ) {
        const backButton = scene.add.text(500, 960, 'Back', { fontSize: '36px', color: '#ffffff', strokeThickness: 2 })
        .setInteractive()
        .on('pointerdown', () => {
                scene.scene.stop("UIScene");
                scene.scene.stop("MapScene");
                scene.scene.start('MenuScene');
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

}