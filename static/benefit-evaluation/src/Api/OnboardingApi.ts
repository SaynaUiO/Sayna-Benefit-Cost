import { invoke } from "@forge/bridge";

export const onboardingApi = () => {
  return {
    isOnboardingComplete: (): Promise<boolean> => {
      return invoke("isOnboardingComplete")
    },
    setOnboardingComplete: (onboardingComplete: boolean): Promise<void> => {
      return invoke("setOnboardingComplete", { onboardingComplete })
    }
  }
}