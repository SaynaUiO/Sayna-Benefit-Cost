export interface Objective {
    id: string;          // O1, O2, O3...
    name: string;        // The objective's text
    description: string; // Detailed description
    parentId?: string;   // Optional: ID of the parent item, if applicable
}