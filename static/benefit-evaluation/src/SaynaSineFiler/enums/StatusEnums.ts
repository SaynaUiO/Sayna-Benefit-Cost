export enum StatusEnum {
    TODO = "To Do",
    IN_PROGRESS = "In Progress",
    DONE = "Done",
    // Add other statuses here if your project uses them (e.g., BLOCKED = "Blocked", CANCELLED = "Cancelled")
  }
  
  // Helper function to map your status to a Lozeng appearance
  export const getLozengAppearance = (status: StatusEnum): 'default' | 'inprogress' | 'success' => {
    switch (status) {
      case StatusEnum.TODO:
        return 'default'; // Typically grey for "To Do"
      case StatusEnum.IN_PROGRESS:
        return 'inprogress'; // Blue for "In Progress"
      case StatusEnum.DONE:
        return 'success'; // Green for "Done" or "Completed"
      default:
        return 'default'; // Fallback for unknown statuses
    }
  };