

export function resizeAndCenterImage(image: Phaser.GameObjects.Image, boundingBox: Phaser.Geom.Rectangle) {
    const boxWidth = boundingBox.width;
    const boxHeight = boundingBox.height;

    const imageAspectRatio = image.width / image.height;
    const boxAspectRatio = boxWidth / boxHeight;

    if (imageAspectRatio > boxAspectRatio) {
        image.displayWidth = boxWidth;
        image.displayHeight = boxWidth / imageAspectRatio;
    } else {
        image.displayHeight = boxHeight;
        image.displayWidth = boxHeight * imageAspectRatio;
    }

    // Center the image within the bounding box
    image.setPosition(
        // TODO fix
        boundingBox.x + boundingBox.width / 2,
        boundingBox.y + boundingBox.height / 2
    );
}
