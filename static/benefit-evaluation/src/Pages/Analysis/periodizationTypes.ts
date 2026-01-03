// periodizationTypes.ts
import { useTranslation } from "@forge/react";
import { useMemo } from "react";

export interface ProfileOption {
  label: string;
  value: string;
}

export type ProfileOptionMap = Record<string, ProfileOption>;

export interface EpicProfileSelections {
  [epicId: string]: {
    benefitProfileKey: string;
    costProfileKey: string;
  };
}

// 1. Static Keys
export const BENEFIT_PROFILE_KEYS = {
  DELAY_UNIFORM: "BP_DELAY_UNIFORM",
  DELAY_PLATEAU: "BP_DELAY_PLATEAU",
  DELAY_PEAK_DET: "BP_DELAY_PEAK_DET",
  IMM_INCREASE: "BP_IMM_INCREASE",
  BEGINNERS_DET: "BP_BEGINNERS_DET",
  UNIFORM: "BP_UNIFORM",
};

export const COST_PROFILE_KEYS = {
  DEV1_UNIFORM: "SP_DEV1_UNIFORM",
  DEV1_DECREASING: "SP_DEV1_DECREASING",
  HIGH_DEV_LOW_DEC: "SP_HIGH_DEV_LOW_DEC",
  LOW_DEV_INCREASING: "SP_LOW_DEV_INCREASING",
  HIGH_DEV_DECREASING: "SP_HIGH_DEV_DECREASING",
};

// Helper to turn array into a Map
const getProfileMap = (options: ProfileOption[]): ProfileOptionMap => {
  return options.reduce((acc, option) => {
    acc[option.value] = option;
    return acc;
  }, {} as ProfileOptionMap);
};

// 2. The Hook
export const usePeriodizationProfiles = () => {
  const { t } = useTranslation();

  // Create Localized Arrays
  const benefitProfiles: ProfileOption[] = useMemo(() => [
    { label: t("profiles.benefit.delay_uniform"), value: BENEFIT_PROFILE_KEYS.DELAY_UNIFORM },
    { label: t("profiles.benefit.delay_plateau"), value: BENEFIT_PROFILE_KEYS.DELAY_PLATEAU },
    { label: t("profiles.benefit.delay_peak_det"), value: BENEFIT_PROFILE_KEYS.DELAY_PEAK_DET },
    { label: t("profiles.benefit.imm_increase"), value: BENEFIT_PROFILE_KEYS.IMM_INCREASE },
    { label: t("profiles.benefit.beginners_det"), value: BENEFIT_PROFILE_KEYS.BEGINNERS_DET },
    { label: t("profiles.benefit.uniform"), value: BENEFIT_PROFILE_KEYS.UNIFORM },
  ], [t]);

  const costProfiles: ProfileOption[] = useMemo(() => [
    { label: t("profiles.cost.dev1_uniform"), value: COST_PROFILE_KEYS.DEV1_UNIFORM },
    { label: t("profiles.cost.dev1_decreasing"), value: COST_PROFILE_KEYS.DEV1_DECREASING },
    { label: t("profiles.cost.high_dev_low_dec"), value: COST_PROFILE_KEYS.HIGH_DEV_LOW_DEC },
    { label: t("profiles.cost.low_dev_increasing"), value: COST_PROFILE_KEYS.LOW_DEV_INCREASING },
    { label: t("profiles.cost.high_dev_decreasing"), value: COST_PROFILE_KEYS.HIGH_DEV_DECREASING },
  ], [t]);

  // Create Maps from the localized arrays
  const benefitProfileMap = useMemo(() => getProfileMap(benefitProfiles), [benefitProfiles]);
  const costProfileMap = useMemo(() => getProfileMap(costProfiles), [costProfiles]);

  // IMPORTANT: You must return all 4 here!
  return { 
    benefitProfiles, 
    costProfiles, 
    benefitProfileMap, 
    costProfileMap 
  };
};