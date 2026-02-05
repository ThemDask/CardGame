import { Card } from "../../entities/Card";
import { Hex } from "../../entities/Hex";
import Phaser from 'phaser';

/**
 * UI-only state manager
 * Handles UI concerns that don't need to be synced across clients:
 * - Selected cards
 * - Hover states
 * - UI animations
 * - Local preferences
 */
export class UIManager {
    private static instance: UIManager;
    
    // UI-only state (not synced)
    private selectedCard: Card | null = null;
    private selectedHex: Hex | null = null;
    private hoveredCard: Card | null = null;
    private hoveredHex: Hex | null = null;
    
    // Deck builder state (local only)
    public selectedDeck: string[] | null = null;

    private constructor() {}

    public static getInstance(): UIManager {
        if (!UIManager.instance) {
            UIManager.instance = new UIManager();
        }
        return UIManager.instance;
    }

    // Card selection
    public setSelectedCard(card: Card | null): void {
        this.selectedCard = card;
    }

    public getSelectedCard(): Card | null {
        return this.selectedCard;
    }

    public clearSelectedCard(): void {
        this.selectedCard = null;
    }

    // Hex selection
    public setSelectedHex(hex: Hex | null): void {
        this.selectedHex = hex;
    }

    public getSelectedHex(): Hex | null {
        return this.selectedHex;
    }

    public clearSelectedHex(): void {
        this.selectedHex = null;
    }

    // Hover states
    public setHoveredCard(card: Card | null): void {
        this.hoveredCard = card;
    }

    public getHoveredCard(): Card | null {
        return this.hoveredCard;
    }

    public setHoveredHex(hex: Hex | null): void {
        this.hoveredHex = hex;
    }

    public getHoveredHex(): Hex | null {
        return this.hoveredHex;
    }

    // Clear all selections
    public clearAllSelections(): void {
        this.selectedCard = null;
        this.selectedHex = null;
        this.hoveredCard = null;
        this.hoveredHex = null;
    }

    // Deck builder
    public setSelectedDeck(deck: string[]): void {
        this.selectedDeck = deck;
    }

    public getSelectedDeck(): string[] | null {
        return this.selectedDeck;
    }
}
