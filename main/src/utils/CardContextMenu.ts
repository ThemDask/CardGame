import Phaser from 'phaser';
import { Card } from '../entities/Card';
import { buttonOverStroke, buttonOutStroke, buttonUpStroke, buttonOverStyle, buttonOutStyle, buttonUpStyle } from './styles';

export type CardContextMenuCallback = (row: number, col: number) => void;

const MENU_WIDTH = 160;
const MENU_HEIGHT = 110;
const BUTTON_SPACING = 28;

export class CardContextMenu extends Phaser.GameObjects.Container {
    private overlay: Phaser.GameObjects.Rectangle;
    private background: Phaser.GameObjects.Rectangle;
    private moveAttackButton: Phaser.GameObjects.Text;
    private shootButton: Phaser.GameObjects.Text;
    private activateAbilityButton: Phaser.GameObjects.Text;
    private onMoveAttack: CardContextMenuCallback;
    private onShoot: CardContextMenuCallback;
    private onActivateAbility: CardContextMenuCallback;
    private currentRow: number = 0;
    private currentCol: number = 0;
    private shootEnabled: boolean = true;

    constructor(
        scene: Phaser.Scene,
        onMoveAttack: CardContextMenuCallback,
        onShoot: CardContextMenuCallback,
        onActivateAbility: CardContextMenuCallback
    ) {
        super(scene, 0, 0);
        this.onMoveAttack = onMoveAttack;
        this.onShoot = onShoot;
        this.onActivateAbility = onActivateAbility;

        // Overlay for click-outside-to-close (like DeckDisplayModal)
        this.overlay = scene.add.rectangle(0, 0, scene.scale.width, scene.scale.height, 0x000000, 0.3)
            .setOrigin(0)
            .setInteractive()
            .on('pointerdown', () => this.close());

        // Background rectangle - sized to fit all 3 buttons
        this.background = scene.add.rectangle(0, 0, MENU_WIDTH, MENU_HEIGHT, 0x222222, 1)
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0);

        // Move/Attack button - UIScene style: bold plain text, hover turns red
        this.moveAttackButton = this.createTextButton(12, 12, 'Move/Attack', () => {
            this.close();
            this.onMoveAttack(this.currentRow, this.currentCol);
        });

        // Shoot button
        this.shootButton = this.createTextButton(12, 12 + BUTTON_SPACING, 'Shoot', () => {
            if (!this.shootEnabled) return;
            this.close();
            this.onShoot(this.currentRow, this.currentCol);
        });

        // Activate Ability button
        this.activateAbilityButton = this.createTextButton(12, 12 + BUTTON_SPACING * 2, 'Activate Ability', () => {
            this.close();
            this.onActivateAbility(this.currentRow, this.currentCol);
        });

        this.add([this.overlay, this.background, this.moveAttackButton, this.shootButton, this.activateAbilityButton]);
        this.setVisible(false);
        this.setDepth(1000);
        scene.add.existing(this);
    }

    private createTextButton(x: number, y: number, text: string, onClick: () => void): Phaser.GameObjects.Text {
        const buttonText = this.scene.add.text(x, y, text, {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0).setStroke(buttonOutStroke.colour, buttonOutStroke.thickness).setInteractive();

        buttonText.on('pointerover', () => {
            buttonText.setStroke(buttonOverStroke.colour, buttonOverStroke.thickness);
            buttonText.setStyle({ ...buttonOverStyle, fontSize: '24px' });
        });

        buttonText.on('pointerout', () => {
            buttonText.setStroke(buttonOutStroke.colour, buttonOutStroke.thickness);
            buttonText.setStyle({ ...buttonOutStyle, fontSize: '24px' });
        });

        buttonText.on('pointerup', () => {
            buttonText.setStroke(buttonUpStroke.colour, buttonUpStroke.thickness);
            buttonText.setStyle({ ...buttonUpStyle, fontSize: '24px' });
            onClick();
        });

        return buttonText;
    }

    open(x: number, y: number, row: number, col: number, card: Card) {
        this.currentRow = row;
        this.currentCol = col;

        // Disable Shoot button if card has no range or ranged_damage
        this.shootEnabled = (card.range ?? 0) > 0 && (card.ranged_damage ?? 0) > 0;
        this.shootButton.setAlpha(this.shootEnabled ? 1 : 0.5);

        // Position menu near the card (offset to the right/below)
        const offsetX = 50;
        const offsetY = -40;

        this.x = x + offsetX;
        this.y = y + offsetY;

        // Keep menu on screen
        const padding = 10;
        if (this.x + MENU_WIDTH > this.scene.scale.width - padding) {
            this.x = this.scene.scale.width - MENU_WIDTH - padding;
        } else if (this.x < padding) {
            this.x = padding;
        }
        if (this.y + MENU_HEIGHT > this.scene.scale.height - padding) {
            this.y = this.scene.scale.height - MENU_HEIGHT - padding;
        } else if (this.y < padding) {
            this.y = padding;
        }

        // Keep overlay covering full screen (overlay is child, so offset by negative position)
        this.overlay.setPosition(-this.x, -this.y);

        this.setVisible(true);
    }

    close() {
        this.setVisible(false);
    }

    isOpen(): boolean {
        return this.visible;
    }

    isOpenFor(row: number, col: number): boolean {
        return this.visible && this.currentRow === row && this.currentCol === col;
    }
}
