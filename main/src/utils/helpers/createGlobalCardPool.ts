import { Card } from "../../entities/Card";
import cardData from '../../../../public/cardData.json'; // Make sure this path is correct based on your file structure


interface CardData {
    id: string;
    type: string;
    name: string;
    movement: number;
    damage: number;
    ranged_damage: number;
    range: number;
    hp: number;
    cost: number;
    description: string;
    imagePath: string;
    keywords: string[];
  }


export function createGlobalCardPool(replaceWithPlaceholder: boolean): Card[] {
  // Map each JSON object to a new Card instance
  const cards: Card[] = (cardData as CardData[]).map(data => new Card(
    data.id,
    data.type,
    data.name,
    data.movement,
    data.damage,
    data.ranged_damage,
    data.range,
    data.hp,
    data.cost,
    data.description,
    data.imagePath,
    data.keywords
  ));

  if (replaceWithPlaceholder == true) {
    addPlaceholderImage(cards)
  }

  return cards;
}

// Function to update the imagePath of all cards to 'archer' (placeholder)
function addPlaceholderImage(cards: Card[]): Card[] {
  return cards.map(card => {
    card.imagePath = 'archer';
    return card;
  });
}