import { Epic } from "../types/Epic";

export const PRODUCT_GOALS: Epic[] = [
    {
        id: "prod-epic-1",
        name: "Epic 1:",
        description: "The tool will provide new sources of revenue and financial obligations.",
        timeEstimate: 50,
        costEstimate: 2,
        parentId: "product-root" 
    },
    {
        id: "prod-epic-2",
        name: "Epic 2:",
        description: "The product shall provide consumers with financial information.",
        timeEstimate: 10,
        costEstimate: 0.5,
        parentId: "product-root" 
    },
];