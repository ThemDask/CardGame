// GameStateManager.ts
import { Player } from "../entities/Player";
// import { Card } from "../entities/Card";

export class GameStateManager {
    private static instance: GameStateManager;
    
    private player1: Player;
    private player2: Player;
    private turnCounter: number;

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

}