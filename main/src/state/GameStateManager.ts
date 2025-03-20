import { Card } from "../entities/Card";
import { Hex } from "../entities/Hex";
import { Player } from "../entities/Player";

export class GameStateManager {
    private static instance: GameStateManager;
    
    private player1: Player;
    private player2: Player;
    private turnCounter: number;

    public selectedDeck: string[] | null = null;
    
    public selectedCard: Card | null = null;  // Stores selected card from deck
    public selectedHex: Hex | null = null;    // Stores selected hex on the map

    private constructor() {
        this.turnCounter = 1;
    }

    public static getInstance(): GameStateManager {
        if (!GameStateManager.instance) {
            GameStateManager.instance = new GameStateManager();
        }
        return GameStateManager.instance;
    }

    public setPlayer1(player: Player): void {
        this.player1 = player;
    }

    public getPlayer1() {
        return this.player1;
    }

    public setPlayer2(player: Player): void {
        this.player2 = player;
    }

    public getPlayer2() {
        return this.player2;
    }

    public getTurnCounter(): number {
        return this.turnCounter;
    }

    public incrementTurn(): void {
        this.turnCounter += 1;
    }

    public setSelectedDeck(deck: string[]): void {
        this.selectedDeck = deck;
    }

    public getSelectedDeck(): string[] | null {
        return this.selectedDeck;
    }

      // New methods for card selection and deployment
      public setSelectedCard(card: Card | null): void {
        this.selectedCard = card;
    }

    public getSelectedCard(): Card | null {
        return this.selectedCard;
    }

    public setSelectedHex(hex: Hex | null): void {
        this.selectedHex = hex;
    }

    public getSelectedHex(): Hex | null {
        return this.selectedHex;
    }

    public clearSelections(): void {
        this.selectedCard = null;
        this.selectedHex = null;
    }

}