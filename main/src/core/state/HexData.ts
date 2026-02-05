import { Card } from "../../entities/Card";
import { HexType } from "../../utils/styles";

/**
 * Serializable hex data (no Phaser objects)
 * Used in GameState for multiplayer sync
 */
export interface HexData {
    occupied: boolean;
    occupiedBy: Card | null;
    occupiedByPlayerId: string | null;
    type: HexType;
    row: number;
    col: number;
}

/**
 * Helper to convert Hex entity to HexData
 */
export function hexToData(hex: any): HexData {
    return {
        occupied: hex.occupied,
        occupiedBy: hex.occupiedBy,
        occupiedByPlayerId: hex.occupiedByPlayerId,
        type: hex.type,
        row: hex.row,
        col: hex.col
    };
}
