import { Method, storageAPI } from "../api/storageAPI"

export const getIsOnboardingCompleted = async (accountId: string, projectId: string): Promise<boolean> => {
    let completed: boolean = false
    const onboarding = await storageAPI(Method.get, `ob-${projectId}-${accountId}`)
    if (onboarding !== undefined && onboarding === true) completed = true

    console.info(`GET onboardingComplete: ${accountId} (${projectId}) - ${completed}`)
    return completed
}

export const setIsOnboardingCompleted = async (accountId: string, completed: boolean, projectId: string): Promise<void> => {
    console.info(`SET onboardingComplete: ${accountId} (${projectId}) - ${completed}`)
    await storageAPI(Method.set, `ob-${projectId}-${accountId}`, completed)
}