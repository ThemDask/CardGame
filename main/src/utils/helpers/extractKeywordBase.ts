    // Helper function to extract the base keyword, e.g., "armour" from "armour 1", "armour 2", etc.
    export function extractKeywordBase(keyword: string): string {
        // Match one or more words (letters only) and exclude numbers
        const match = keyword.match(/^([a-zA-Z\s]+)/); // Matches words and spaces only
        return match ? match[0].trim() : keyword; // If no match, return the original keyword
    }