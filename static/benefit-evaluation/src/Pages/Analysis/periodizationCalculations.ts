// src/analysis/periodizationCalculations.ts

// Hent kun det du trenger, og merk at Goal/EpicGoal nå er Goal i din fil
import { Goal } from "../../Models"; 
import { 
    Distribution, 
    BP_DISTRIBUTIONS, 
    SP_DISTRIBUTIONS, 
    DISCOUNT_RATE_PER_YEAR
} from "./PeriodizationProfiles";

// Endret fra Goal til EpicGoal for å være mer eksplisitt i typenavn (hvis du foretrekker dette)
// Ellers behold Goal. Jeg bruker EpicGoal for klarhet.
type EpicGoal = Goal; 

// Henter typen for EpicProfileSelections fra din Analysis.tsx
interface EpicProfileSelections {
  [epicId: string]: {
    // Endret fra bpProfile/spProfile til benefitProfileKey/costProfileKey
    // Siden vi kun trenger nøkkelen for oppslag, er dette renere.
    benefitProfileKey: string; 
    costProfileKey: string;
  };
}

// Type for det endelige, aggregerte resultatet for én periode (ÅR)
export interface PeriodizationPeriodResult {
  period: number; // År 1, År 2, 3, ...
  grossBenefit: number; // Tidligere totalBP
  grossCost: number;   // Tidligere totalSP
  netPoints: number;
  discountFactor: number;
  netPresentValue: number; // Tidligere netDiscountedPoints
  accumulatedNPV: number; 
}

/**
 * Beregner periodiserte poeng for én Epic (Epic-periodisering).
 * Vi forenkler denne funksjonen og fjerner den fra eksport, siden den kun brukes
 * internt i calculateTotalPeriodization.
 */
const calculateEpicPeriodization = (
  epic: EpicGoal, 
  selections: EpicProfileSelections[string],
  periods: number
): { epicId: string; periodizedSP: Distribution; periodizedBP: Distribution } => {
  
  // Merk: Bruker epic.issueCost?.cost for Cost (SP) og epic.balancedPoints?.value for Benefit (BP)
  const totalSP = epic.issueCost?.cost || 0;
  const totalBP = epic.balancedPoints?.value || 0;
  
  // Hent profilen og kall funksjonen for å få fordelingen
  // Bruker nøklene direkte fra selections-objektet
  const spDistributionKey = selections.costProfileKey;
  const bpDistributionKey = selections.benefitProfileKey;

  // Bruker null-sjekk med default funksjon (som er bedre enn å hardkode nøkler)
  const spProfileFunc = SP_DISTRIBUTIONS[spDistributionKey] || SP_DISTRIBUTIONS['SP_UNIFORM_COST'];
  const bpProfileFunc = BP_DISTRIBUTIONS[bpDistributionKey] || BP_DISTRIBUTIONS['BP_UNIFORM'];

  const spDistribution = spProfileFunc(periods);
  const bpDistribution = bpProfileFunc(periods);

  // Multipliser totalpoengene med fordelingsprosentene (element for element)
  const periodizedSP: Distribution = spDistribution.map(
    (factor) => factor * totalSP
  );

  const periodizedBP: Distribution = bpDistribution.map(
    (factor) => factor * totalBP
  );

  return {
    epicId: epic.id,
    periodizedSP,
    periodizedBP,
  };
};

/**
 * Aggregerer periodiserte poeng fra alle Epics og beregner Netto Nåverdi (NPV).
 *
 * @param allEpics - Alle Epic-målene.
 * @param allSelections - Alle brukerens profilvalg.
 * @param periods - Totalt antall perioder (ÅR).
 * @returns Array med PeriodizationPeriodResult for alle periodene.
 */
export const calculateTotalPeriodization = (
  allEpics: EpicGoal[],
  allSelections: EpicProfileSelections,
  periods: number
): PeriodizationPeriodResult[] => {
  
  if (allEpics.length === 0 || periods < 1) return [];

  // 1. Beregn periodiserte poeng for HVER ENKELT EPIC
  const periodizedResults = allEpics.map(epic => {
    // Sjekker om valget eksisterer for Epicen (setter default til UNIFORM hvis profiler mangler)
    const selection = allSelections[epic.id] || { 
        benefitProfileKey: 'BP_UNIFORM', 
        costProfileKey: 'SP_UNIFORM_COST' 
    };
    return calculateEpicPeriodization(epic, selection, periods);
  });

  // Array som holder de aggregerte resultatene for hver periode
  let aggregatedResults: PeriodizationPeriodResult[] = [];
  let accumulatedNPV = 0;

  // 2. Iterer gjennom HVER PERIODE (ÅR)
  for (let i = 0; i < periods; i++) {
    const periodNumber = i + 1; // År 1, År 2, etc.
    let grossCost = 0;
    let grossBenefit = 0;

    // Summer opp Cost og Benefit fra ALLE Epics for denne perioden
    periodizedResults.forEach(res => {
      // Sikkerhetssjekk
      if (res.periodizedSP[i] !== undefined) {
          grossCost += res.periodizedSP[i];
          grossBenefit += res.periodizedBP[i];
      }
    });

    const netPoints = grossBenefit - grossCost;
    
    // 3. Beregn Discount Factor og NPV
    // Formel: DF = 1 / (1 + r)^t, hvor r er den ÅRLIGE renten og t er antall ÅR
    const discountFactor = 1 / Math.pow(1 + DISCOUNT_RATE_PER_YEAR, periodNumber);
    
    const netPresentValue = netPoints * discountFactor;
    
    // 4. Beregn Akkumulert NPV
    accumulatedNPV += netPresentValue;

    aggregatedResults.push({
      period: periodNumber,
      grossCost: parseFloat(grossCost.toFixed(2)),
      grossBenefit: parseFloat(grossBenefit.toFixed(2)),
      netPoints: parseFloat(netPoints.toFixed(2)),
      discountFactor: parseFloat(discountFactor.toFixed(4)),
      netPresentValue: parseFloat(netPresentValue.toFixed(2)),
      accumulatedNPV: parseFloat(accumulatedNPV.toFixed(2)),
    });
  }

  return aggregatedResults;
};