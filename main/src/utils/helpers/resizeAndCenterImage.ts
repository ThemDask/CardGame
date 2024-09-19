

export function resizeAndCenterImage(image: Phaser.GameObjects.Image, boundingBox: Phaser.Geom.Rectangle) {
    const boxWidth = boundingBox.width;
    const boxHeight = boundingBox.height;

    const imageAspectRatio = image.width / image.height;
    const boxAspectRatio = boxWidth / boxHeight;

    if (imageAspectRatio > boxAspectRatio) {
        // Image is wider, fit by width
        image.displayWidth = boxWidth;
        image.displayHeight = boxWidth / imageAspectRatio;
    } else {
        // Image is taller, fit by height
        image.displayHeight = boxHeight;
        image.displayWidth = boxHeight * imageAspectRatio;
    }

    // Center the image within the bounding box
    image.setPosition(
        // TODO fix
        // boundingBox.x + boundingBox.width / 2 - image.displayWidth / 2,
        // boundingBox.y + boundingBox.height / 2 - image.displayHeight / 2

        150,
        200
    );
}
