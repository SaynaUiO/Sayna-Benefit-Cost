//Dette er målene for Planlagte Nyttevirkninger hvor vi har 3 
//Kategorier: Samfunnsmål, Organisasjonsmålog Effektmål: 

export type BenefitCategory = 'Samfunnsmål' | 'Organisasjonsmål' | 'Effektmål';

export interface BenefitGoal {
    id: string;
    name: string;
    description: string;
    category: BenefitCategory; // The specific type of benefit goal
    weight: number;      // For the "Weight %" column
    parentId?: string;   // For nesting under the main 'Planlagte Nyttevirkninger' header
}