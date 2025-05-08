import { ReactNode, createContext, useContext, useMemo, useState } from 'react'
import { useAPI } from '../../Contexts/ApiContext'
import { ScrollContextProvider } from '../../Components/Estimation/ScrollContext'
import {
    EstimationMode,
    EstimationTarget,
    EstimationProps,
} from '../../Models/EstimationModel'

export type EstimationContext = EstimationProps<EstimationMode> & {
    isSubmitting: boolean
    readyToSubmit: boolean
    updateGoals: (scopeId: string) => void
    getUpperGoalDP: (upperGoalId: string) => number
    updateUpperGoalDP: (
        upperGoalId: string,
        points: number,
        scopeId: string
    ) => void
    onSubmit: () => void
}

const estimationContext = createContext<EstimationContext>(undefined!)

export const useEstimation = () => {
    return useContext(estimationContext)
}

type EstimationContextProviderPoviderProps = {
    estimationProps: EstimationProps<EstimationMode>
    children: ReactNode
}

export const EstimationContextProvider = ({
    estimationProps,
    children,
}: EstimationContextProviderPoviderProps) => {
    const { mode, upperGoalTier, upperGoals, pointsToDistribute, relation } =
        estimationProps
    const [estimationTargets, setEstimationTargets] = useState<
        EstimationTarget<EstimationMode>[]
    >(estimationProps.estimationTargets)
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const [upperGoalDP, setUpperGoalDP] = useState<{
        [scopeId: string]: { [upperGoalId: string]: number }
    }>()

    const api = useAPI()

    const getUpperGoalDP = (upperGoalId: string) => {
        let totalPoints = 0
        for (const estimationTarget of estimationTargets) {
            totalPoints +=
                upperGoalDP?.[estimationTarget.scope.id]?.[upperGoalId] || 0
        }
        return totalPoints
    }

    const updateUpperGoalDP = (
        upperGoalId: string,
        points: number,
        scopeId: string
    ) => {
        setUpperGoalDP((prev) => {
            const newUpperGoalDP = { ...prev }
            if (!newUpperGoalDP[scopeId]) {
                newUpperGoalDP[scopeId] = {}
            }
            newUpperGoalDP[scopeId][upperGoalId] = points
            return newUpperGoalDP
        })
    }

    const updateGoals = (scopeId: string) => {
        setEstimationTargets((prevTargets) => {
            const updatedTargets = [...prevTargets]
            const updatedTarget = updatedTargets.find(
                (target) => target.scope.id === scopeId
            )
            if (updatedTarget) {
                updatedTarget.goals
            }
            return updatedTargets
        })
    }

    const onSubmit = () => {
        setSubmitting(true)
        api.estimation
            .submit(mode, estimationTargets, estimationProps.upperGoals)
            .then(() => {
                setSubmitting(false)
            })
            .catch((error) => {
                setSubmitting(false)
                console.error(`Error submitting estimation ${error}`)
            })
    }

    const validate = (): boolean => {
        let validated = true
        for (const upperGoal of estimationProps.upperGoals) {
            if (getUpperGoalDP(upperGoal.id) !== pointsToDistribute) {
                validated = false
            }
        }
        return validated
    }

    const readyToSubmit = useMemo(() => {
        return validate()
    }, [upperGoalDP])

    const value: EstimationContext = {
        mode,
        upperGoalTier: upperGoalTier,
        upperGoals: upperGoals,
        relation,
        pointsToDistribute,
        estimationTargets,
        isSubmitting,
        readyToSubmit: readyToSubmit,
        updateGoals: updateGoals,
        getUpperGoalDP: getUpperGoalDP,
        updateUpperGoalDP: updateUpperGoalDP,
        onSubmit: onSubmit,
    }

    return (
        <estimationContext.Provider value={value}>
            <ScrollContextProvider>{children}</ScrollContextProvider>
        </estimationContext.Provider>
    )
}
