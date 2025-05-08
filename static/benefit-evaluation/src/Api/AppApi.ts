import { invoke } from "@forge/bridge";

export const appApi = () => {
  return {
    reset: () => {
      return invoke("resetApp");
    }
  }
}