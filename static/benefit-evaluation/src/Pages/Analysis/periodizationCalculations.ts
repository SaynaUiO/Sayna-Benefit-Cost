// src/analysis/periodizationCalculations.ts

import { Goal } from "../../Models";
import { Distribution, BP_DISTRIBUTIONS, SP_DISTRIBUTIONS, DISCOUNT_RATE_PER_YEAR} from "./PeriodizationProfiles";
// Antar at Goal er importert fra et annet sted
// import { Goal } from '...'; 

// Henter typen for EpicProfileSelections fra din Analysis.tsx
interface EpicProfileSelections {
  [epicId: string]: {
    bpProfile: { value: string } | null; // Vi trenger kun value for å slå opp profilen
    spProfile: { value: string } | null;
  };
}

// Type for å lagre periodiserte poeng for EN EPIC
export interface PeriodizedEpicPoints {
  epicId: string;
  periodizedSP: Distribution; // [Q1_SP, Q2_SP, Q3_SP, Q4_SP, ...]
  periodizedBP: Distribution; // [Q1_BP, Q2_BP, Q3_BP, Q4_BP, ...]
}

// Type for det endelige, aggregerte resultatet for én periode (kvartal)
export interface PeriodizationPeriodResult {
  period: number; // 1, 2, 3, 4, ...
  totalSP: number;
  totalBP: number;
  netPoints: number;
  discountFactor: number;
  netDiscountedPoints: number; // Netto Nåverdi
  accumulatedNPV: number; // Akkumulert Netto Nåverdi
}

/**
 * Beregner periodiserte Size Points (SP) og Benefit Points (BP) for én Epic.
 * * @param epic - Målobjektet som inneholder total SP og BP.
 * @param selections - Valgt SP- og BP-profil for Epicen.
 * @param periods - Totalt antall perioder (f.eks. 4, 8, 16).
 * @returns PeriodizedEpicPoints
 */
export const calculateEpicPeriodization = (
  epic: Goal, 
  selections: EpicProfileSelections[string],
  periods: number
): PeriodizedEpicPoints => {
  
  const totalSP = epic.issueCost?.cost || 0;
  const totalBP = epic.balancedPoints?.value || 0;
  
  // 1. Hent profilen og kall funksjonen for å få fordelingen
  const spDistributionKey = selections.spProfile?.value || 'SP_UNIFORM_COST';
  const bpDistributionKey = selections.bpProfile?.value || 'BP_UNIFORM';

  const spProfileFunc = SP_DISTRIBUTIONS[spDistributionKey] || SP_DISTRIBUTIONS['SP_UNIFORM_COST'];
  const bpProfileFunc = BP_DISTRIBUTIONS[bpDistributionKey] || BP_DISTRIBUTIONS['BP_UNIFORM'];

  const spDistribution = spProfileFunc(periods);
  const bpDistribution = bpProfileFunc(periods);

  // 2. Multipliser totalpoengene med fordelingsprosentene (element for element)
  const periodizedSP: Distribution = spDistribution.map(
    (factor) => factor * totalSP
  );

  const periodizedBP: Distribution = bpDistribution.map(
    (factor) => factor * totalBP
  );

  // 3. Returner resultatene
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
 * @param periods - Totalt antall perioder (f.eks. 4).
 * @returns Array med PeriodizationPeriodResult for alle periodene.
 */
export const calculateTotalPeriodization = (
  allEpics: Goal[],
  allSelections: EpicProfileSelections,
  periods: number
): PeriodizationPeriodResult[] => {
  
  if (allEpics.length === 0 || periods === 0) return [];

  // 1. Beregn periodiserte poeng for HVER ENKELT EPIC
  const periodizedResults = allEpics.map(epic => {
    // Sjekker om valget eksisterer for Epicen (viktig for initial state)
    const selection = allSelections[epic.id] || { bpProfile: null, spProfile: null };
    return calculateEpicPeriodization(epic, selection, periods);
  });

  // Array som holder de aggregerte resultatene for hver periode
  let aggregatedResults: PeriodizationPeriodResult[] = [];
  let accumulatedNPV = 0;

  // 2. Iterer gjennom HVER PERIODE (Kvartal)
  for (let i = 0; i < periods; i++) {
    const periodNumber = i + 1;
    let totalSP = 0;
    let totalBP = 0;

    // Summer opp SP og BP fra ALLE Epics for denne perioden
    periodizedResults.forEach(res => {
      // Sikkerhetssjekk for å unngå feil ved ufullstendig beregning
      if (res.periodizedSP[i] !== undefined) {
          totalSP += res.periodizedSP[i];
          totalBP += res.periodizedBP[i];
      }
    });

    const netPoints = totalBP - totalSP;
    
    // 3. Beregn Discount Factor og NPV
    // For Q1 (n=1), Q2 (n=2), etc.
    const discountFactor = 1 / Math.pow(1 + DISCOUNT_RATE_PER_YEAR, periodNumber);
    
    const netDiscountedPoints = netPoints * discountFactor;
    
    // 4. Beregn Akkumulert NPV
    accumulatedNPV += netDiscountedPoints;

    aggregatedResults.push({
      period: periodNumber,
      totalSP: parseFloat(totalSP.toFixed(2)),
      totalBP: parseFloat(totalBP.toFixed(2)),
      netPoints: parseFloat(netPoints.toFixed(2)),
      discountFactor: parseFloat(discountFactor.toFixed(4)),
      netDiscountedPoints: parseFloat(netDiscountedPoints.toFixed(2)),
      accumulatedNPV: parseFloat(accumulatedNPV.toFixed(2)),
    });
  }

  return aggregatedResults;
};