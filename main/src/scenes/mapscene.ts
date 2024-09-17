import Phaser from "phaser";

export class Mapscene extends Phaser.Scene {
  
    // constructor    
    constructor() {
        super({
            key : 'PreloadAssets'
        });
    }
  
    // method to be called during class preloading
    preload() : void {
 
        // load image
        this.load.image('gem', '/assets/9.jpg');
        
    }
  
    // method to be executed when the scene is created
    create() : void {

        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'gem').setOrigin(0.5, 0.5);
    }
}