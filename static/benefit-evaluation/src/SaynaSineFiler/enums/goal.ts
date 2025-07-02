//This file will centralize the goal tier enum ans the utility functions to maps between the numeric enum ans string representation

export enum GoalTierTypeEnum {
    FORMAAL = 0,
    NYTTEVIRKNING = 1,
    PRODUKT = 2,
    EPIC = 3,
    // Assuming '4' from your backend data (tier: 4) represents a base 'Goal Collection' type
    GOAL_COLLECTION = 4,
    // Add other numeric enum values if you have them in your backend
  }
  
  /**
   * Maps a numeric GoalTierTypeEnum value to its human-readable string.
   * Used for displaying goal types in the UI.
   */
  export const mapEnumToGoalTypeString = (enumValue: GoalTierTypeEnum): string => {
    switch (enumValue) {
      case GoalTierTypeEnum.FORMAAL:
        return "Formål";
      case GoalTierTypeEnum.NYTTEVIRKNING:
        return "Prosjektets Nyttevirkning";
      case GoalTierTypeEnum.PRODUKT:
        return "Prosjektets Produkt";
      case GoalTierTypeEnum.EPIC:
        return "Epic";
      case GoalTierTypeEnum.GOAL_COLLECTION:
        return "Goal Collection"; // Adjust this string if it means something else in your UI
      default:
        console.warn(`Unknown GoalTierTypeEnum value: ${enumValue}. Defaulting to "Unknown".`);
        return "Unknown";
    }
  };
  
  /**
   * Maps a human-readable goal type string to its numeric GoalTierTypeEnum value.
   * Used when sending goal type data to the backend.
   */
  export const mapGoalTypeStringToEnum = (typeString: string): GoalTierTypeEnum => {
    switch (typeString) {
      case "Formål":
        return GoalTierTypeEnum.FORMAAL;
      case "Prosjektets Nyttevirkning":
        return GoalTierTypeEnum.NYTTEVIRKNING;
      case "Prosjektets Produkt":
        return GoalTierTypeEnum.PRODUKT;
      case "Epic":
        return GoalTierTypeEnum.EPIC;
      case "Goal Collection": // Also include this if "Goal Collection" string can be passed in
        return GoalTierTypeEnum.GOAL_COLLECTION;
      default:
        console.warn(`Unknown goal type string: "${typeString}". Defaulting to GOAL_COLLECTION.`);
        return GoalTierTypeEnum.GOAL_COLLECTION; // Default for unknown strings
    }
  };