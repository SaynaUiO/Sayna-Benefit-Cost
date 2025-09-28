import { BenefitGoal } from "../types/benefit";

export const BENEFIT_GOALS: BenefitGoal[] = [
    // Samfunnsmål
    {
        id: "samf-1",
        name: "SAMF1",
        description: "Reduce the number of case backlogs for sole proprietorships (By 80%)",
        category: "Samfunnsmål",
        weight: 25,
        parentId: "benefit-root"
    },
    // Organisasjonsmål
    {
        id: "org-1",
        name: "ORG1",
        description: "Reduce the number of cases handled by the Labour Inspection Authority related to sole proprietorships (by 20%)",
        category: "Organisasjonsmål",
        weight: 25,
        parentId: "benefit-root"
    },
    // Effektmål
    {
        id: "eff-1",
        name: "EFF1",
        description: "Shorten case processing time; a total of three equivalent 7.4 full-time equivalents (FTES) is freed over a 5-year period.",
        category: "Effektmål",
        weight: 35,
        parentId: "benefit-root"
    },
    {
        id: "eff-2",
        name: "Eff2",
        description: "Increased quality: the number of mishandled cases is at most 5%.",
        category: "Effektmål",
        weight: 15,
        parentId: "benefit-root"
    },
];