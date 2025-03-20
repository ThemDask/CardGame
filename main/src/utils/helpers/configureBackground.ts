

export function configureBackground(scene: Phaser.Scene) {
    const { width, height } = scene.scale;

    const background = scene.add.image(width / 2, height / 2, 'bg');

    background.setDisplaySize(width, height);
    
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x000000, 0.5); // black with 50% transparency
    graphics.fillRect(0, 0, width, height);
}