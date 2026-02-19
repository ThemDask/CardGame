import Phaser from 'phaser';
import { Card } from '../entities/Card';
import { CardDetailsPanel } from '../utils/CardDetailsPanel';
import { createGlobalCardPool } from '../utils/helpers/createGlobalCardPool';
import { configureBackground } from '../utils/helpers/configureBackground';
import { sceneManager } from '../core/sceneManager';

export class DraftScene extends Phaser.Scene {
    private cardDetailsPanel!: CardDetailsPanel;

    private creaturePool: Card[] = [];
    private player1Picks: Card[] = [];
    private player2Picks: Card[] = [];
    private selectedCards: Card[] = [];

    private creaturePoolContainer!: Phaser.GameObjects.Container;
    private itemPoolContainer!: Phaser.GameObjects.Container;
    private player1Container!: Phaser.GameObjects.Container;
    private player2Container!: Phaser.GameObjects.Container;

    private isPlayerTurn: boolean = true;
    private isDraftComplete: boolean = false;
    private turnIndicator!: Phaser.GameObjects.Text;

    /** Pick sequence: P1:1, P2:2, P1:2, P2:2, ... until last card to P1. Index into this array. */
    private pickRound: number = 0;
    private readonly PICK_SEQUENCE: { player: 1 | 2; count: number }[] = [
        { player: 1, count: 1 },
        { player: 2, count: 2 },
        { player: 1, count: 2 }, { player: 2, count: 2 }, { player: 1, count: 2 }, { player: 2, count: 2 },
        { player: 1, count: 2 }, { player: 2, count: 2 }, { player: 1, count: 2 }, { player: 2, count: 2 },
        { player: 1, count: 1 },
    ];

    private confirmButton!: Phaser.GameObjects.Rectangle;
    private confirmText!: Phaser.GameObjects.Text;
    private cancelButton!: Phaser.GameObjects.Rectangle;
    private cancelText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'DraftScene' });
    }

    preload() {
        this.load.image('archer', '/assets/archer.png');
        this.load.image('damage', '/assets/damage.png');
        this.load.image('health', '/assets/hp.png');
        this.load.image('movement', '/assets/movement.png');
        this.load.image('range', '/assets/range.png');
        this.load.image('ranged_dmg', '/assets/ranged_dmg.png');
        this.load.image('bg', '/assets/bg1.png');
    }

    create() {
        configureBackground(this);

        this.input.keyboard?.on('keydown-ESC', () => {
            sceneManager.openEscapeMenu(this);
        });

        this.player1Picks = [];
        this.player2Picks = [];
        this.selectedCards = [];
        this.isPlayerTurn = true;
        this.isDraftComplete = false;
        this.pickRound = 0;

        const allCards = createGlobalCardPool(true);
        const creatureCards = allCards.filter(c => c.type === 'creature');
        this.creaturePool = this.shuffleAndPick(creatureCards, 20);

        this.cardDetailsPanel = new CardDetailsPanel(this, 5, 5, 500, 700);
        this.cardDetailsPanel.updatePanel(null);

        this.createConfirmCancelButtons();
        this.createMiddleSection();
        this.createRightSection();
        this.createTurnIndicator();

        this.refreshCreaturePool();
        this.refreshPlayerPicks(1);
        this.refreshPlayerPicks(2);
        this.updateButtonsVisibility();
    }

    private shuffleAndPick(cards: Card[], count: number): Card[] {
        const shuffled = [...cards];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, Math.min(count, shuffled.length));
    }

    // --- Layout ---

    private readonly MIDDLE_X = 530;
    private readonly RIGHT_X = 1250;
    private readonly TOP_Y = 70;
    private readonly MIDDLE_WIDTH = 700;
    private readonly RIGHT_WIDTH = 480;
    private readonly CREATURE_RECT_HEIGHT = 600;
    private readonly ITEM_RECT_HEIGHT = 300;
    private readonly PLAYER_RECT_HEIGHT = 430;

    private createConfirmCancelButtons() {
        const panelBottom = 5 + 700;
        const btnWidth = 120;
        const btnHeight = 45;
        const btnX = 5 + (500 - btnWidth) / 2;

        this.confirmButton = this.add.rectangle(btnX, panelBottom + 25, btnWidth, btnHeight)
            .setStrokeStyle(3, 0xffffff).setOrigin(0);
        this.confirmText = this.add.text(btnX + btnWidth / 2, panelBottom + 25 + btnHeight / 2, 'Confirm', {
            font: '20px Arial', color: '#ffffff'
        }).setOrigin(0.5);
        this.confirmButton.setInteractive();
        this.confirmButton.on('pointerdown', () => this.handleConfirm());
        this.confirmButton.on('pointerover', () => this.confirmButton.setFillStyle(0x228822, 0.5));
        this.confirmButton.on('pointerout', () => this.confirmButton.setFillStyle(0x000000, 0));

        this.cancelButton = this.add.rectangle(btnX, panelBottom + 85, btnWidth, btnHeight)
            .setStrokeStyle(3, 0xffffff).setOrigin(0);
        this.cancelText = this.add.text(btnX + btnWidth / 2, panelBottom + 85 + btnHeight / 2, 'Cancel', {
            font: '20px Arial', color: '#ffffff'
        }).setOrigin(0.5);
        this.cancelButton.setInteractive();
        this.cancelButton.on('pointerdown', () => this.handleCancel());
        this.cancelButton.on('pointerover', () => this.cancelButton.setFillStyle(0x882222, 0.5));
        this.cancelButton.on('pointerout', () => this.cancelButton.setFillStyle(0x000000, 0));
    }

    private updateButtonsVisibility() {
        const isPlayer1Turn = this.isPlayerTurn && !this.isDraftComplete;
        const current = this.PICK_SEQUENCE[this.pickRound];
        const showButtons = isPlayer1Turn && current?.player === 1;

        this.confirmButton.setVisible(showButtons);
        this.confirmText.setVisible(showButtons);
        this.cancelButton.setVisible(showButtons);
        this.cancelText.setVisible(showButtons);

        if (showButtons) {
            const required = current.count;
            const canConfirm = this.selectedCards.length === required;
            this.confirmButton.setAlpha(canConfirm ? 1 : 0.5);
            this.confirmButton.removeInteractive();
            if (canConfirm) this.confirmButton.setInteractive();
        }
    }

    private createMiddleSection() {
        this.add.rectangle(
            this.MIDDLE_X, this.TOP_Y,
            this.MIDDLE_WIDTH, this.CREATURE_RECT_HEIGHT
        ).setStrokeStyle(3, 0xffffff).setOrigin(0);

        this.add.text(this.MIDDLE_X + 10, this.TOP_Y - 30, 'Creature Pool', {
            font: '24px Arial', color: '#ffffff'
        });

        this.creaturePoolContainer = this.add.container(
            this.MIDDLE_X + 20, this.TOP_Y + 15
        );

        const itemY = this.TOP_Y + this.CREATURE_RECT_HEIGHT + 30;
        this.add.rectangle(
            this.MIDDLE_X, itemY,
            this.MIDDLE_WIDTH, this.ITEM_RECT_HEIGHT
        ).setStrokeStyle(3, 0xffffff).setOrigin(0);

        this.add.text(this.MIDDLE_X + 10, itemY - 30, 'Item Pool', {
            font: '24px Arial', color: '#888888'
        });

        this.itemPoolContainer = this.add.container(
            this.MIDDLE_X + 20, itemY + 15
        );

        this.displayCards([], this.itemPoolContainer, 8, 4, 100, 120, 10, 15, false);
    }

    private createRightSection() {
        const totalHeight = this.CREATURE_RECT_HEIGHT + 30 + this.ITEM_RECT_HEIGHT;
        this.add.rectangle(
            this.RIGHT_X, this.TOP_Y,
            this.RIGHT_WIDTH, totalHeight
        ).setStrokeStyle(3, 0xffffff).setOrigin(0);

        const innerWidth = this.RIGHT_WIDTH - 20;
        const p1Y = this.TOP_Y + 10;

        this.add.rectangle(
            this.RIGHT_X + 10, p1Y,
            innerWidth, this.PLAYER_RECT_HEIGHT
        ).setStrokeStyle(2, 0x4488ff).setOrigin(0);

        this.add.text(this.RIGHT_X + 20, p1Y + 5, 'Player 1', {
            font: '20px Arial', color: '#4488ff'
        });

        this.player1Container = this.add.container(
            this.RIGHT_X + 20, p1Y + 35
        );

        const p2Y = p1Y + this.PLAYER_RECT_HEIGHT + 20;

        this.add.rectangle(
            this.RIGHT_X + 10, p2Y,
            innerWidth, this.PLAYER_RECT_HEIGHT
        ).setStrokeStyle(2, 0xff4444).setOrigin(0);

        this.add.text(this.RIGHT_X + 20, p2Y + 5, 'Player 2 (AI)', {
            font: '20px Arial', color: '#ff4444'
        });

        this.player2Container = this.add.container(
            this.RIGHT_X + 20, p2Y + 35
        );
    }

    private createTurnIndicator() {
        const info = this.getCurrentPickInfo();
        const text = info?.player === 1 ? `Select ${info.count} card(s)` : "AI's Pick...";
        const color = info?.player === 1 ? '#00ff00' : '#ff4444';
        this.turnIndicator = this.add.text(
            this.MIDDLE_X + this.MIDDLE_WIDTH / 2,
            this.TOP_Y - 35,
            text,
            { font: '28px Arial', color }
        ).setOrigin(0.5);
    }

    // --- Card grid display (reuses DeckBuilderScene / DeploymentScene pattern) ---

    private displayCards(
        cards: Card[],
        container: Phaser.GameObjects.Container,
        maxSlots: number,
        slotsPerRow: number,
        slotWidth: number,
        slotHeight: number,
        marginX: number,
        marginY: number,
        isPickable: boolean,
        selectedCards: Card[] = []
    ) {
        const selectedSet = new Set(selectedCards);
        for (let i = 0; i < maxSlots; i++) {
            const row = Math.floor(i / slotsPerRow);
            const col = i % slotsPerRow;
            const slotX = col * (slotWidth + marginX);
            const slotY = row * (slotHeight + marginY);

            const slotBackground = this.add.rectangle(slotX, slotY, slotWidth, slotHeight)
                .setStrokeStyle(2, 0xffffff).setOrigin(0);
            container.add(slotBackground);

            if (i < cards.length) {
                const card = cards[i];
                const isSelected = selectedSet.has(card);
                if (isSelected) slotBackground.setStrokeStyle(5, 0x00cc00);

                const imageKey = (card.imagePath && this.textures.exists(card.imagePath))
                    ? card.imagePath : 'archer';
                const cardImage = this.add.image(
                    slotX + slotWidth / 2, slotY + slotHeight / 2, imageKey
                ).setDisplaySize(slotWidth, slotHeight);
                container.add(cardImage);

                cardImage.setInteractive();

                cardImage.on('pointerover', () => {
                    this.cardDetailsPanel.updatePanel(card);
                    if (!isSelected) slotBackground.setStrokeStyle(5, 0x00cc00);
                });

                cardImage.on('pointerout', () => {
                    this.cardDetailsPanel.updatePanel(null);
                    if (!selectedSet.has(card)) slotBackground.setStrokeStyle(2, 0xffffff);
                });

                if (isPickable) {
                    cardImage.on('pointerdown', () => {
                        this.handleCardToggle(card);
                    });
                }
            }
        }
    }

    private refreshCreaturePool() {
        this.creaturePoolContainer.removeAll(true);
        this.displayCards(
            this.creaturePool, this.creaturePoolContainer,
            20, 5, 100, 120, 10, 15, true,
            this.selectedCards
        );
    }

    private refreshPlayerPicks(playerNum: 1 | 2) {
        const container = playerNum === 1 ? this.player1Container : this.player2Container;
        const picks = playerNum === 1 ? this.player1Picks : this.player2Picks;
        container.removeAll(true);
        this.displayCards(picks, container, 14, 5, 80, 100, 8, 10, false);
    }

    // --- Draft logic ---

    private getCurrentPickInfo(): { player: 1 | 2; count: number } | null {
        return this.PICK_SEQUENCE[this.pickRound] ?? null;
    }

    private handleCardToggle(card: Card) {
        if (this.isDraftComplete || !this.isPlayerTurn) return;
        const info = this.getCurrentPickInfo();
        if (!info || info.player !== 1) return;
        if (!this.creaturePool.includes(card)) return;

        const idx = this.selectedCards.indexOf(card);
        if (idx >= 0) {
            this.selectedCards.splice(idx, 1);
        } else {
            if (this.selectedCards.length >= info.count) return;
            this.selectedCards.push(card);
        }
        this.refreshCreaturePool();
        this.updateButtonsVisibility();
    }

    private handleConfirm() {
        if (this.isDraftComplete || !this.isPlayerTurn) return;
        const info = this.getCurrentPickInfo();
        if (!info || info.player !== 1 || this.selectedCards.length !== info.count) return;

        for (const card of this.selectedCards) {
            const i = this.creaturePool.indexOf(card);
            if (i >= 0) this.creaturePool.splice(i, 1);
            this.player1Picks.push(card);
        }
        this.selectedCards = [];
        this.advanceTurn();
    }

    private handleCancel() {
        this.selectedCards = [];
        this.refreshCreaturePool();
        this.updateButtonsVisibility();
    }

    private advanceTurn() {
        this.refreshCreaturePool();
        this.refreshPlayerPicks(1);
        this.refreshPlayerPicks(2);
        this.updateButtonsVisibility();

        if (this.creaturePool.length === 0) {
            this.completeDraft();
            return;
        }

        this.pickRound++;
        const info = this.getCurrentPickInfo();
        if (!info) {
            this.completeDraft();
            return;
        }

        if (info.player === 1) {
            this.turnIndicator.setText(`Select ${info.count} card(s)`);
            this.turnIndicator.setColor('#00ff00');
        } else {
            this.isPlayerTurn = false;
            this.turnIndicator.setText("AI's Pick...");
            this.turnIndicator.setColor('#ff4444');
            this.time.delayedCall(800, () => this.aiPick());
        }
    }

    private aiPick() {
        const info = this.getCurrentPickInfo();
        if (!info || info.player !== 2 || this.creaturePool.length === 0) {
            this.completeDraft();
            return;
        }

        const count = Math.min(info.count, this.creaturePool.length);
        const shuffled = [...this.creaturePool];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const toPick = shuffled.slice(0, count);
        for (const card of toPick) {
            const i = this.creaturePool.indexOf(card);
            if (i >= 0) this.creaturePool.splice(i, 1);
            this.player2Picks.push(card);
        }

        this.refreshCreaturePool();
        this.refreshPlayerPicks(2);

        if (this.creaturePool.length === 0) {
            this.completeDraft();
            return;
        }

        this.pickRound++;
        const next = this.getCurrentPickInfo();
        if (!next) {
            this.completeDraft();
            return;
        }

        if (next.player === 1) {
            this.isPlayerTurn = true;
            this.turnIndicator.setText(`Select ${next.count} card(s)`);
            this.turnIndicator.setColor('#00ff00');
            this.updateButtonsVisibility();
        } else {
            this.time.delayedCall(800, () => this.aiPick());
        }
    }

    private completeDraft() {
        this.isDraftComplete = true;
        this.turnIndicator.setText('Draft Complete! Starting game...');
        this.turnIndicator.setColor('#ffff00');

        this.time.delayedCall(1500, () => {
            sceneManager.startGame(this, this.player1Picks, this.player2Picks);
        });
    }
}
