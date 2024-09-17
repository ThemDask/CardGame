import Phaser from "phaser";

export class DeckbuilderScene extends Phaser.Scene {
    
  
    constructor() {
        super({
            key : 'DeckbuilderScene'
        });
    }
  
    preload() : void {
 
        // load image
        // this.load.image('gem', '/assets/9.jpg');
        
    }
  

    create() : void {

        // this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'gem').setOrigin(0.5, 0.5);
    }
}