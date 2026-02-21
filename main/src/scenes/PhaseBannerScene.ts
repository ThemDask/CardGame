import Phaser from 'phaser';

const PHASE_LABELS: Record<string, string> = {
    draft: 'Draft Phase',
    deployment: 'Deployment Phase',
    combat: 'Combat Phase',
};

export class PhaseBannerScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PhaseBannerScene' });
    }

    init(data: { phase?: 'draft' | 'deployment' | 'combat' }) {
        (this as any).phaseData = data.phase ?? 'draft';
    }

    create() {
        const phase = (this as any).phaseData as string;
        const label = PHASE_LABELS[phase] ?? phase;

        const { width, height } = this.scale;

        const overlay = this.add.rectangle(width / 2, height / 2, width * 2, height * 2, 0x000000, 0.6)
            .setOrigin(0.5)
            .setDepth(1000);

        const bannerWidth = 1000;
        const bannerHeight = 80;
        const banner = this.add.rectangle(width / 2, height / 2, bannerWidth, bannerHeight, 0x1a1a1a, 0.95)
            .setStrokeStyle(4, 0xffffff)
            .setOrigin(0.5)
            .setDepth(1001);

        const text = this.add.text(width / 2, height / 2, label, {
            font: '42px Arial',
            color: '#ffffff',
        })
            .setOrigin(0.5)
            .setDepth(1002);

        this.time.delayedCall(1000, () => {
            this.scene.stop('PhaseBannerScene');
        });
    }
}
