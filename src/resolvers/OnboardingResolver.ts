import { storage } from "@forge/api";
import Resolver from "@forge/resolver";
import { getIsOnboardingCompleted, setIsOnboardingCompleted } from "../services/OnboardingService";

interface SetOnboardingPayload {
    onboardingComplete: boolean;
}

export const onboardingResolver = (resolver: Resolver) => {
    resolver.define('isOnboardingComplete', async ({ context }): Promise<boolean> => {
        return getIsOnboardingCompleted(context.accountId, context.extension.project.id)
    })

    resolver.define('setOnboardingComplete', async ({ context, payload }: { context: any, payload: SetOnboardingPayload }) => {
        setIsOnboardingCompleted(context.accountId, payload.onboardingComplete, context.extension.project.id)
    })
}