
export interface Epic {
    id: string;
    name: string;
    description: string;
    timeEstimate: number; // For the "Time" column
    costEstimate: number; // For the "Cost" column
    parentId?: string;    // To link to a parent if needed
}