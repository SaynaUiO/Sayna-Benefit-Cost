// src/analysis/periodizationProfiles.ts

// Array av variabel lengde N (År)
export type Distribution = number[]; 

// Funksjon som genererer en Distribution basert på antall perioder
export type ProfileFunction = (periods: number) => Distribution;

// Finansiell konstant for NPV-beregning (ÅRSRENTE)
export const DISCOUNT_RATE_PER_YEAR = 0.10; // 10% årlig diskonteringsrente

// --- Hjelpefunksjon ---
/** Sikrer at distribusjonen summerer til nøyaktig 1.0 og runder av desimaler. */
const normalizeAndRound = (distribution: number[], precision: number = 4): Distribution => {
    const sum = distribution.reduce((a, b) => a + b, 0);
    if (sum === 0) return Array(distribution.length).fill(0);
    
    // Normaliserer og runder av for å minimere flytkommafeil
    let normalized = distribution.map(val => val / sum);
    normalized = normalized.map(val => parseFloat(val.toFixed(precision)));
    
    // Justerer den siste verdien for å garantere at totalsummen blir 1.0
    const finalSum = normalized.reduce((a, b) => a + b, 0);
    const adjustment = 1.0 - finalSum;
    if (normalized.length > 0) {
        normalized[normalized.length - 1] = parseFloat((normalized[normalized.length - 1] + adjustment).toFixed(precision));
    }
    
    return normalized;
};


// --- Benefit Profiles (BP) ---

export const BP_DISTRIBUTIONS: Record<string, ProfileFunction> = {
  
  // 1. Enkel jevn fordeling
  BP_UNIFORM: (periods: number): Distribution => {
    // Normalisering håndteres av normalizeAndRound
    return Array(periods).fill(1);
  },

  // 2. Forsinket Platå: Større gevinst i andre halvdel (f.eks. etter lansering)
  BP_DELAY_PLATEAU: (periods: number): Distribution => {
    const half = Math.ceil(periods / 2);
    const distribution: number[] = [];
    
    // Gir lav verdi i første halvdel (f.eks. 30% av total gevinst)
    for (let i = 0; i < half; i++) {
        distribution.push(0.30);
    }
    // Gir høyere verdi i andre halvdel (f.eks. 70% av total gevinst)
    for (let i = half; i < periods; i++) {
        distribution.push(0.70);
    }
    
    return normalizeAndRound(distribution);
  },

  // 3. Uniform med forsinkelse: Jevn fordeling etter en innledende forsinkelse
  BP_DELAY_UNIFORM: (periods: number): Distribution => {
    const delayPeriods = Math.max(1, Math.round(periods * 0.25));
    const distribution: number[] = Array(periods).fill(0);

    // Setter alle perioder etter forsinkelsen til 1 (normalisering fikser andelen)
    for (let i = delayPeriods; i < periods; i++) {
      distribution[i] = 1;
    }
    
    return normalizeAndRound(distribution);
  },

  // 4. Forsinkelse m/ topp og fall: Forsinkelse i starten, topp i midten, deretter fall
  BP_DELAY_PEAK_DET: (periods: number): Distribution => {
    const peakIndex = Math.round(periods * 0.6) - 1; 
    const earlyPeriods = Math.max(1, Math.round(periods * 0.2)); 

    const distribution: number[] = Array(periods).fill(0);
    
    // Low gain (før topp) - Setter en baseverdi i tidlige år
    for (let i = 0; i < earlyPeriods; i++) {
        distribution[i] = 0.05; 
    }
    
    // Gradvis økning til toppverdi (Setter høyere verdier frem mot toppen)
    const peakTarget = 0.25;
    for (let i = earlyPeriods; i <= peakIndex; i++) {
        // Enkel økning: Bruker periodenummer for å gi en stigning
        distribution[i] = (i - earlyPeriods + 1) * 0.1; 
    }
    distribution[peakIndex] = peakTarget;

    // Gradvis fall (deterioration)
    let deteriorationRate = peakTarget;
    for (let i = peakIndex + 1; i < periods; i++) {
        deteriorationRate = Math.max(0.01, deteriorationRate * 0.7); 
        distribution[i] = deteriorationRate;
    }

    return normalizeAndRound(distribution);
  },

  // 5. Umiddelbar effekt m/ lineær økning og platå: Starter umiddelbart, øker, stabiliserer seg
  BP_IMM_INCREASE: (periods: number): Distribution => {
    const plateauStart = Math.round(periods * 0.75);
    const distribution: number[] = Array(periods).fill(0);
    const peakValue = 0.15;
    
    // Lineær økning (verdien øker for hver periode)
    for (let i = 0; i < plateauStart; i++) {
        distribution[i] = (i + 1); 
    }
    
    // Platå (holder seg stabil)
    for (let i = plateauStart; i < periods; i++) {
        distribution[i] = plateauStart; 
    }
    
    return normalizeAndRound(distribution);
  },

  // 6. Begynnerentusiasme og fall: Topp tidlig, deretter raskt fall
  BP_BEGINNERS_DET: (periods: number): Distribution => {
    const peakIndex = 0; // Toppen er i første år
    const distribution: number[] = Array(periods).fill(0);
    
    distribution[peakIndex] = 0.40; // 40% base i År 1
    
    // Raskt fall
    let deteriorationRate = 0.40;
    for (let i = peakIndex + 1; i < periods; i++) {
        deteriorationRate = Math.max(0.01, deteriorationRate * 0.5); // 50% fall per år
        distribution[i] = deteriorationRate;
    }

    return normalizeAndRound(distribution);
  },
}; 

// --- Cost Profiles (SP) ---

export const SP_DISTRIBUTIONS: Record<string, ProfileFunction> = {
  
  // 1. Jevn kostnad over alle perioder
  SP_UNIFORM_COST: (periods: number): Distribution => {
    return Array(periods).fill(1);
  },
  
  // 2. Høy utvikling (første 25%), lav synkende vedlikehold
  SP_HIGH_DEV_LOW_DEC: (periods: number): Distribution => {
    const devPeriods = Math.max(1, Math.round(periods * 0.25)); 
    const distribution: number[] = [];
    
    // Utviklingsfase (Høye verdier)
    for (let i = 0; i < devPeriods; i++) {
        distribution.push(10); // Høy base
    }
    
    // Vedlikeholdsfase (Synkende rate)
    let rate = 5; // Starter lavere enn dev
    for (let i = devPeriods; i < periods; i++) {
        rate = Math.max(1, rate * 0.8); // 20% reduksjon per år, min 1
        distribution.push(rate);
    }
    
    return normalizeAndRound(distribution.slice(0, periods)); 
  },

  // 3. Konsentrert utvikling (År 1), deretter jevnt vedlikehold
  SP_DEV1_UNIFORM: (periods: number): Distribution => {
    const distribution: number[] = Array(periods).fill(0);
    distribution[0] = 50; // Høy base i År 1 (50% av kostnaden)
    
    // Jevn fordeling av resten
    for (let i = 1; i < periods; i++) {
        distribution[i] = 10;
    }
    
    return normalizeAndRound(distribution);
  },

  // 4. Utvikling (År 1) med synkende vedlikehold
  SP_DEV1_DECREASING: (periods: number): Distribution => {
    const distribution: number[] = Array(periods).fill(0);
    distribution[0] = 50;
    
    // Synkende vedlikehold
    let rate = 10;
    for (let i = 1; i < periods; i++) {
        rate = Math.max(1, rate * 0.85); // 15% reduksjon per år
        distribution[i] = rate;
    }
    
    return normalizeAndRound(distribution);
  },

  // 5. Lav utvikling (År 1), noe som fører til økende vedlikehold
  SP_LOW_DEV_INCREASING: (periods: number): Distribution => {
    const distribution: number[] = Array(periods).fill(0);
    distribution[0] = 10; // Lav base i År 1
    
    // Økende vedlikehold
    let rate = 5;
    for (let i = 1; i < periods; i++) {
        rate = rate * 1.15; // 15% økning per år
        distribution[i] = rate;
    }
    
    return normalizeAndRound(distribution);
  },
};


// --- Profilvalg for UI ---

export interface ProfileOption {
  label: string;
  value: string;
}

// Gjør labelene mer lesbare (f.eks. "UNIFORM" i stedet for "BP_UNIFORM")
const formatLabel = (key: string): string => {
    return key.replace(/BP_|SP_/g, '').replace(/_/g, ' ');
};

export const benefitProfileOptions: ProfileOption[] = Object.keys(BP_DISTRIBUTIONS).map(key => ({
    label: formatLabel(key), 
    value: key,
}));

export const costProfileOptions: ProfileOption[] = Object.keys(SP_DISTRIBUTIONS).map(key => ({
    label: formatLabel(key),
    value: key,
}));


