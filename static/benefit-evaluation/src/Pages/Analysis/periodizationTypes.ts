// periodizationTypes.ts

// 1. Definerer typen for Select Options
export interface ProfileOption {
  label: string;
  value: string;
}

// 2. Definerer Map-typen for oppslag
export type ProfileOptionMap = Record<string, ProfileOption>;

// 3. Definerer grensesnittet for lagrede profilvalg
export interface EpicProfileSelections {
  [epicId: string]: {
    benefitProfileKey: string;
    costProfileKey: string;
  };
}

// 4. Benefit Profiles (BP)
export const benefitProfiles: ProfileOption[] = [
  { label: "Jevn, med oppstartsforsinkelse", value: "BP_DELAY_UNIFORM" },
  {
    label: "Gradvis økning til stabilt nivå (Platå)",
    value: "BP_DELAY_PLATEAU",
  },
  {
    label: "Forsinkelse med toppeffekt og gradvis forringelse",
    value: "BP_DELAY_PEAK_DET",
  },
  {
    label: "Umiddelbar effekt med jevn økning til stabilt nivå",
    value: "BP_IMM_INCREASE",
  },
  {
    label: "Rask økning, topp og rask forringelse (Nybegynner entusiasme)",
    value: "BP_BEGINNERS_DET",
  },
  { label: "Jevn (uten forsinkelse/endring)", value: "BP_UNIFORM" },
];

// 5. Cost Profiles (SP)
export const costProfiles: ProfileOption[] = [
  {
    label: "Høy utvikling (1 periode) med jevn etterfølgende drift",
    value: "SP_DEV1_UNIFORM",
  },
  {
    label: "Høy utvikling (1 periode) med synkende etterfølgende drift",
    value: "SP_DEV1_DECREASING",
  },
  {
    label:
      "Svært høy utvikling (1 periode) med lav, synkende etterfølgende drift",
    value: "SP_HIGH_DEV_LOW_DEC",
  },
  {
    label: "Lav utvikling (1 periode) med økende etterfølgende drift",
    value: "SP_LOW_DEV_INCREASING",
  },
  {
    label: "Høy utvikling (1 periode) med synkende etterfølgende drift",
    value: "SP_HIGH_DEV_DECREASING",
  },
];

// 6. NYTTIG: Lager Map for raskt oppslag
export const getProfileMap = (
  options: ProfileOption[]
): ProfileOptionMap => {
  return options.reduce((acc, option) => {
    acc[option.value] = option;
    return acc;
  }, {} as ProfileOptionMap);
};

export const benefitProfileMap = getProfileMap(benefitProfiles);
export const costProfileMap = getProfileMap(costProfiles);