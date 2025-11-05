// src/analysis/periodizationCalculations.ts

// Hent kun det du trenger, og merk at Goal/EpicGoal nå er Goal i din fil
import { Goal } from "../../Models"; 
import { 
    Distribution, 
    BP_DISTRIBUTIONS, 
    SP_DISTRIBUTIONS, 
    DISCOUNT_RATE_PER_YEAR
} from "./PeriodizationProfiles";

type EpicGoal = Goal; 

interface EpicProfileSelections {
  [epicId: string]: {
    benefitProfileKey: string; 
    costProfileKey: string;
  };
}

// Type for det endelige, aggregerte resultatet for én periode (ÅR)
export interface PeriodizationPeriodResult {
  period: number; 
  grossBenefit: number; 
  grossCost: number;   
  netPoints: number; // Endres til netPoints/netNOK for å reflektere kontekst.
  discountFactor: number;
  netPresentValue: number; // Dette er nå Netto Nåverdi i NOK
  accumulatedNPV: number; 
}

/**
 * Beregner periodiserte poeng/NOK-verdier for én Epic (Epic-periodisering).
 * NÅ TAR DEN INN BEREGNEDE NOK-VERDIER (totalValue) ISTEDENFOR POENG.
 */
const calculateEpicPeriodization = (
  epicId: string, // Holder EpicId for kontekst
  totalBPValue: number, // TOTAL NYTTEVERDI I NOK
  totalSPValue: number, // TOTAL KOSTNAD I NOK
  selections: EpicProfileSelections[string],
  periods: number
): { epicId: string; periodizedSP: Distribution; periodizedBP: Distribution } => {
  
  // Hent profilen og kall funksjonen for å få fordelingen
  const spDistributionKey = selections.costProfileKey;
  const bpDistributionKey = selections.benefitProfileKey;

  const spProfileFunc = SP_DISTRIBUTIONS[spDistributionKey] || SP_DISTRIBUTIONS['SP_UNIFORM_COST'];
  const bpProfileFunc = BP_DISTRIBUTIONS[bpDistributionKey] || BP_DISTRIBUTIONS['BP_UNIFORM'];

  const spDistribution = spProfileFunc(periods);
  const bpDistribution = bpProfileFunc(periods);

  // Multipliser total NOK-verdien med fordelingsprosentene (element for element)
  const periodizedSP: Distribution = spDistribution.map(
    (factor) => factor * totalSPValue
  );

  const periodizedBP: Distribution = bpDistribution.map(
    (factor) => factor * totalBPValue
  );

  return {
    epicId,
    periodizedSP,
    periodizedBP,
  };
};

/**
 * Aggregerer periodiserte NOK-verdier fra alle Epics og beregner Netto Nåverdi (NPV).
 *
 * @param allEpics - Alle Epic-målene.
 * @param allSelections - Alle brukerens profilvalg.
 * @param periods - Totalt antall perioder (ÅR).
 * @param bpNokFactor - Konverteringsfaktor for BP til NOK (NY)
 * @param spNokFactor - Konverteringsfaktor for SP til NOK (NY)
 * @returns Array med PeriodizationPeriodResult for alle periodene (Nå i NOK).
 */
export const calculateTotalPeriodization = (
  allEpics: EpicGoal[],
  allSelections: EpicProfileSelections,
  periods: number,
  bpNokFactor: number, // NY: Faktor fra EpicSelectionTable
  spNokFactor: number // NY: Faktor fra EpicSelectionTable
): PeriodizationPeriodResult[] => {
  
  if (allEpics.length === 0 || periods < 1) return [];

  // 1. Beregn periodiserte NOK-verdier for HVER ENKELT EPIC
  const periodizedResults = allEpics.map(epic => {
    // Sjekker om valget eksisterer for Epicen
    const selection = allSelections[epic.id] || { 
        benefitProfileKey: 'BP_UNIFORM', 
        costProfileKey: 'SP_UNIFORM_COST' 
    };
    
    // **KONVERTERING SKJER HER:**
    const totalBP = epic.balancedPoints?.value || 0;
    const totalSP = epic.issueCost?.cost || 0;
    
    const totalBPValue = totalBP * bpNokFactor; // NYTTEVERDI I NOK
    const totalSPValue = totalSP * spNokFactor; // KOSTNAD I NOK

    // Kaller den oppdaterte epic-funksjonen med NOK-verdier
    return calculateEpicPeriodization(
        epic.id, 
        totalBPValue,
        totalSPValue,
        selection, 
        periods
    );
  });

  let aggregatedResults: PeriodizationPeriodResult[] = [];
  let accumulatedNPV = 0;

  // 2. Iterer gjennom HVER PERIODE (ÅR). Alle verdier er nå i NOK.
  for (let i = 0; i < periods; i++) {
    const periodNumber = i + 1; 
    let grossCost = 0;
    let grossBenefit = 0;

    // Summer opp Cost og Benefit (i NOK) fra ALLE Epics for denne perioden
    periodizedResults.forEach(res => {
      if (res.periodizedSP[i] !== undefined) {
          grossCost += res.periodizedSP[i];
          grossBenefit += res.periodizedBP[i];
      }
    });

    // Netto NOK (tidligere netPoints)
    const netNOK = grossBenefit - grossCost; 
    
    // 3. Beregn Discount Factor og NPV
    const discountFactor = 1 / Math.pow(1 + DISCOUNT_RATE_PER_YEAR, periodNumber);
    
    const netPresentValue = netNOK * discountFactor; // Netto Nåverdi i NOK
    
    // 4. Beregn Akkumulert NPV
    accumulatedNPV += netPresentValue;

    aggregatedResults.push({
      period: periodNumber,
      grossCost: parseFloat(grossCost.toFixed(2)),
      grossBenefit: parseFloat(grossBenefit.toFixed(2)),
      netPoints: parseFloat(netNOK.toFixed(2)), // Netto NOK
      discountFactor: parseFloat(discountFactor.toFixed(4)),
      netPresentValue: parseFloat(netPresentValue.toFixed(2)),
      accumulatedNPV: parseFloat(accumulatedNPV.toFixed(2)),
    });
  }

  return aggregatedResults;
};