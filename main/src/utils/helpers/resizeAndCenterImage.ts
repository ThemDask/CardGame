

export function resizeAndCenterImage(image: Phaser.GameObjects.Image, boundingBox: Phaser.Geom.Rectangle) {
    const boxWidth = boundingBox.width;
    const boxHeight = boundingBox.height;

    // Resize the image to fit the bounding box completely
    image.setDisplaySize(boxWidth, boxHeight);

    // Center the image within the bounding box
    image.setPosition(
        boundingBox.x + boundingBox.width / 2,
        boundingBox.y + boundingBox.height / 2
    );
}