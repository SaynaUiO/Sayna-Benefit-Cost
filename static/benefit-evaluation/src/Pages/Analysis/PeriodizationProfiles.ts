
//Typer: 

//Array av variable lengde N (Kvartaler)
export type Distribution = number[]; 

//Funksjon som genererer en Distribution basert på antall perioder
export type ProfileFunction = (periods: number) => Distribution;

// Nødvendig for NPV-beregning (Skla denne endres?)
export const DISCOUNT_RATE_PER_QUARTER = 0.01; 

//---Benefit Profiles---

export const BP_DISTRIBUTIONS: Record<string, ProfileFunction> = {
  // Enkel jevn fordeling
  BP_UNIFORM: (periods: number): Distribution => {
    const p = 1 / periods;
    return Array(periods).fill(p);
  },

  // Impliserer at gevinsten er større i andre halvdel (f.eks. etter modning/lansering)
  BP_DELAY_PLATEAU: (periods: number): Distribution => {
    const half = Math.ceil(periods / 2);
    const firstHalfFactor = 0.30 / half; // 30% av gevinsten
    const secondHalfFactor = 0.70 / (periods - half); // 70% av gevinsten
    
    return Array(periods).fill(0).map((_, i) => {
      if (i < half) return firstHalfFactor;
      return secondHalfFactor;
    });
  },

    // 3. Uniform with delay
  // Forsinkelse antas å være 1/4 av tiden, deretter jevn fordeling av gjenværende 100%.
  BP_DELAY_UNIFORM: (periods: number): Distribution => {
    const delayPeriods = Math.max(1, Math.round(periods * 0.25));
    const activePeriods = periods - delayPeriods;
    const distribution: number[] = Array(periods).fill(0);

    if (activePeriods > 0) {
      const share = 1 / activePeriods;
      for (let i = delayPeriods; i < periods; i++) {
        distribution[i] = share;
      }
    }
    return distribution;
  },

  // 4. Delay with peak and deterioration
  // Forsinkelse i starten, en topp i midten (f.eks. ved rapportfrist), deretter fall.
  BP_DELAY_PEAK_DET: (periods: number): Distribution => {
    // Dette er en mer kompleks funksjon, vi simulerer en tidlig forsinkelse (5% totalt), 
    // en topp rundt 60% av tiden, og et påfølgende fall.
    const peakPeriod = Math.round(periods * 0.6);
    const earlyPeriods = Math.max(1, Math.round(periods * 0.2));
    const lowShare = 0.05 / earlyPeriods; // 5% i starten

    const distribution: number[] = Array(periods).fill(0);
    
    // Low gain (før topp)
    for (let i = 0; i < earlyPeriods; i++) {
        distribution[i] = lowShare;
    }
    
    // Gradvis økning til topp
    let currentShare = lowShare;
    const peakValue = 0.25; // 25% av gevinsten er i topp-perioden
    for (let i = earlyPeriods; i < peakPeriod; i++) {
        currentShare += (peakValue - lowShare) / (peakPeriod - earlyPeriods);
        distribution[i] = currentShare;
    }
    distribution[peakPeriod] = peakValue;

    // Gradvis fall (deterioration)
    const remainingPeriods = periods - peakPeriod - 1;
    let deteriorationRate = peakValue;
    for (let i = peakPeriod + 1; i < periods; i++) {
        deteriorationRate = Math.max(0.01, deteriorationRate * 0.7); // 30% fall i rate per periode
        distribution[i] = deteriorationRate;
    }

    // Normaliser for å sikre at summen er 1.0
    const sum = distribution.reduce((a, b) => a + b, 0);
    return distribution.map(val => val / sum);
  },

  // 5. Immediate effect with linear increase and plateau
  // Starter umiddelbart, øker lineært, og stabiliserer seg.
  BP_IMM_INCREASE: (periods: number): Distribution => {
    const plateauStart = Math.round(periods * 0.75);
    const distribution: number[] = Array(periods).fill(0);
    const peakValue = 0.15; // Maksimal periodeverdi
    
    // Lineær økning
    for (let i = 0; i < plateauStart; i++) {
        distribution[i] = peakValue * ((i + 1) / plateauStart); // Økende fra nesten 0 til peakValue
    }
    
    // Platå
    for (let i = plateauStart; i < periods; i++) {
        distribution[i] = peakValue;
    }
    
    // Normaliser
    const sum = distribution.reduce((a, b) => a + b, 0);
    return distribution.map(val => val / sum);
  },

  // 6. Beginner's enthusiasm and deterioration
  // Topp tidlig (nyhetens interesse), deretter fall.
  BP_BEGINNERS_DET: (periods: number): Distribution => {
    const peakPeriod = 1; // Toppen er i første eller andre periode
    const distribution: number[] = Array(periods).fill(0);
    
    distribution[peakPeriod] = 0.40; // 40% av gevinsten i starten
    
    // Raskt fall
    let deteriorationRate = 0.40;
    for (let i = peakPeriod + 1; i < periods; i++) {
        deteriorationRate = Math.max(0.01, deteriorationRate * 0.5); // 50% fall per periode
        distribution[i] = deteriorationRate;
    }

    // Normaliser
    const sum = distribution.reduce((a, b) => a + b, 0);
    return distribution.map(val => val / sum);
  },
}; 

//---Cost Profiles---

export const SP_DISTRIBUTIONS: Record<string, ProfileFunction> = {
  // 1. Jevn kostnad over alle perioder
  SP_UNIFORM_COST: (periods: number): Distribution => {
    const p = 1 / periods;
    return Array(periods).fill(p);
  },
  
  // 2. Eksempel: Høy utvikling (første 25% av periodene), lav synkende vedlikehold
  SP_HIGH_DEV_LOW_DEC: (periods: number): Distribution => {
    const devPeriods = Math.max(1, Math.round(periods * 0.25)); // Utviklingsfase
    let distribution: number[] = [];
    
    const devCostShare = 0.60 / devPeriods; // 60% av kostnaden i utvikling
    distribution = distribution.concat(Array(devPeriods).fill(devCostShare));
    
    const maintenancePeriods = periods - devPeriods;
    const maintenanceCostShare = 0.40 / maintenancePeriods; // 40% over resten

    if (maintenancePeriods > 0) {
        distribution = distribution.concat(Array(maintenancePeriods).fill(maintenanceCostShare));
    }
    
    return distribution.slice(0, periods); // Sikkerhetskutt
  },

  // 3. Development (1 period) with uniform post deployment
  // Konsentrert utvikling i én periode (Q1), deretter jevnt vedlikehold.
  SP_DEV1_UNIFORM: (periods: number): Distribution => {
    const devCostShare = 0.50; // 50% av kostnaden i Q1
    const maintenanceCostShare = 0.50; // 50% over resten
    
    const distribution: number[] = Array(periods).fill(0);
    distribution[0] = devCostShare; // All utviklingskost i første periode
    
    const remainingPeriods = periods - 1;
    const maintenanceShare = maintenanceCostShare / remainingPeriods;

    for (let i = 1; i < periods; i++) {
        distribution[i] = maintenanceShare;
    }
    
    return distribution;
  },

  // 4. Development (1 period) with decreasing post deployment
  // Samme som over, men vedlikeholdskostnadene synker etter Q1 (bugs fikses tidlig).
  SP_DEV1_DECREASING: (periods: number): Distribution => {
    const devCostShare = 0.50;
    const maintenanceCostShare = 0.50;
    
    const distribution: number[] = Array(periods).fill(0);
    distribution[0] = devCostShare;
    
    const maintenanceDistribution: number[] = [];
    let initialMaintenanceRate = 0.40; // Starter høyt, synker
    let sumMaintenance = 0;
    
    // Simulerer synkende rate (f.eks. 10% reduksjon per periode)
    for (let i = 1; i < periods; i++) {
        const rate = initialMaintenanceRate * Math.pow(0.9, i - 1);
        maintenanceDistribution.push(rate);
        sumMaintenance += rate;
    }
    
    // Normaliserer vedlikeholdsandelene slik at de utgjør totalt 50%
    maintenanceDistribution.forEach(rate => {
        distribution.push((rate / sumMaintenance) * maintenanceCostShare);
    });
    
    return distribution.slice(0, periods);
  },

  // 5. Low development (1 period) with increasing post deployment
  // Lite investering i Q1, noe som fører til høyere og økende vedlikeholdskostnader.
  SP_LOW_DEV_INCREASING: (periods: number): Distribution => {
    const devCostShare = 0.20; // Kun 20% av kostnaden i Q1 (underresourced)
    const maintenanceCostShare = 0.80; // 80% over resten
    
    const distribution: number[] = Array(periods).fill(0);
    distribution[0] = devCostShare;
    
    const maintenanceDistribution: number[] = [];
    let initialMaintenanceRate = 0.10; // Starter lavt, øker
    let sumMaintenance = 0;

    // Simulerer økende rate (f.eks. 15% økning per periode)
    for (let i = 1; i < periods; i++) {
        const rate = initialMaintenanceRate * Math.pow(1.15, i - 1);
        maintenanceDistribution.push(rate);
        sumMaintenance += rate;
    }
    
    // Normaliserer vedlikeholdsandelene slik at de utgjør totalt 80%
    maintenanceDistribution.forEach(rate => {
        distribution.push((rate / sumMaintenance) * maintenanceCostShare);
    });
    
    return distribution.slice(0, periods);
  },
};

//Enkel oversikt for selct: 

export interface ProfileOption {
  label: string;
  value: string;
}

export const benefitProfileOptions: ProfileOption[] = Object.keys(BP_DISTRIBUTIONS).map(key => ({
    label: key.replace(/BP_/g, '').replace(/_/g, ' '), // Gjør key lesbar
    value: key,
}));

export const costProfileOptions: ProfileOption[] = Object.keys(SP_DISTRIBUTIONS).map(key => ({
    label: key.replace(/SP_/g, '').replace(/_/g, ' '),
    value: key,
}));
