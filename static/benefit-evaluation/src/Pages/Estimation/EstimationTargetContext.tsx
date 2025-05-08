import { EstimationField } from '../../Components/Estimation/PointsField'
import { GoalCollectionLabelContainer } from '../../Components/Estimation/Table/GoalCollectionLabelContainer'
import { GoalLabelContainer } from '../../Components/Estimation/Table/GoalLabelContainer'
import { PointsFieldContainer } from '../../Components/Estimation/Table/PointsFieldContainer'
import { TargetLabelContainer } from '../../Components/Estimation/Table/ConnectionLabelContainer'
import { Box, Grid, xcss } from '@atlaskit/primitives'
import EmptyState from '@atlaskit/empty-state'
import Button from '@atlaskit/button'
import {
    EstimationMode,
    PortfolioItemGoal,
    EstimationTarget,
    balancedPointsEnum,
    distributedPoints,
    Goal,
} from '../../Models'
import { createContext, useContext, useState, useEffect } from 'react'
import { calculateBPandTP } from '../../Functions/EstimationHelper'
import { useEstimation } from './EstimationContext'

type EstimationSomethingProps = {
    index: number
    simplified?: boolean
    currentStep?: number
}

type EstimationTargetContextType = EstimationTarget<EstimationMode> & {
    isCollapsed: boolean
    clearGoals: () => void
    updateValues: (
        value: number,
        goal: Goal | PortfolioItemGoal,
        upperGoalId: string
    ) => void
    toogleCollapse: () => void
    getTotalDPPoints: (upperGoalId: string) => number
}

const EvalGCContext = createContext<EstimationTargetContextType>(undefined!)

export const useEstimationTarget = () => {
    return useContext(EvalGCContext)
}

export const EstimationTargetContextProvider = ({
    index,
    simplified,
    currentStep,
}: EstimationSomethingProps) => {
    const {
        estimationTargets,
        upperGoals,
        mode,
        relation,
        pointsToDistribute,
        updateUpperGoalDP: updateUpperGoalDP,
        updateGoals,
    } = useEstimation()

    const target = estimationTargets[index]
    const { goalTier } = target

    const [isCollapsed, setIsCollapsed] = useState<boolean>(false)
    const [goals, setGoals] = useState<(Goal | PortfolioItemGoal)[]>(
        target.goals
    )

    const getTotalDPPoints = (upperGoalId: string): number => {
        return goals.reduce(
            (acc, goal) => acc + goal.distributedPoints![upperGoalId],
            0
        )
    }

    useEffect(() => {
        updateGoals(target.scope.id)
    }, [goals])

    const updateValues = (
        value: number,
        goal: Goal | PortfolioItemGoal,
        upperGoalId: string
    ) => {
        if (mode === EstimationMode.PORTFOLIO_ITEMS) {
            setGoals((prevGoals) => {
                const newGoals = [...prevGoals] as PortfolioItemGoal[]
                const updatedGoal = newGoals.find((g) => g.id === goal.id)
                if (updatedGoal) {
                    updatedGoal.distributedPoints![upperGoalId] = value
                    const { bp, tp } = calculateBPandTP(
                        updatedGoal,
                        upperGoals,
                        relation,
                        pointsToDistribute
                    )
                    updatedGoal.portfolioItemPoints = bp.value
                    let totalConnectionPoints = newGoals.reduce(
                        (acc, goal) => acc + goal.portfolioItemPoints,
                        0
                    )
                    newGoals.forEach((goal) => {
                        goal.balancedPoints = {
                            type: balancedPointsEnum.WEIGHT,
                            value:
                                +(
                                    (goal.portfolioItemPoints /
                                        totalConnectionPoints) *
                                    100
                                ).toFixed(2) || 0,
                            postFix: '%',
                        }
                    })
                }
                return newGoals
            })
        } else {
            setGoals((prevGoals) => {
                const newGoals = [...prevGoals!]
                const updatedGoal = newGoals.find((g) => g.id === goal.id)
                if (updatedGoal) {
                    updatedGoal.distributedPoints![upperGoalId] = value
                    const { bp, tp } = calculateBPandTP(
                        updatedGoal,
                        upperGoals,
                        relation,
                        pointsToDistribute
                    )
                    updatedGoal.balancedPoints = bp
                }
                return newGoals
            })
        }
        updateUpperGoalDP(
            upperGoalId,
            getTotalDPPoints(upperGoalId),
            goal.scopeId
        )
    }

    const clearGoals = () => {
        const clearedDP: distributedPoints = {}
        upperGoals.forEach((upperGoal) => {
            clearedDP[upperGoal.id] = 0
        })
        if (mode === EstimationMode.PORTFOLIO_ITEMS) {
            setGoals((prevGoals) => {
                const newGoals = [...prevGoals] as PortfolioItemGoal[]
                newGoals.forEach((goal) => {
                    goal.distributedPoints = { ...clearedDP }
                    goal.portfolioItemPoints = 0
                    goal.balancedPoints = {
                        type: balancedPointsEnum.WEIGHT,
                        value: 0,
                        postFix: '%',
                    }
                })
                return newGoals
            })
        } else {
            setGoals((prevGoals) => {
                const newGoals = [...prevGoals!]
                newGoals.forEach((goal) => {
                    goal.distributedPoints = { ...clearedDP }
                    goal.balancedPoints = {
                        type: balancedPointsEnum.WEIGHT,
                        value: 0,
                        postFix: '%',
                    }
                })
                return newGoals
            })
        }
        for (const upperGoal of upperGoals) {
            updateUpperGoalDP(upperGoal.id, 0, goalTier.scopeId)
        }
    }

    const calcRowStyle = xcss({
        width: 'max-content',
        display: 'grid',
        gridAutoColumns: '150px',
        gridAutoFlow: 'column',
        borderColor: 'color.border',
        ':hover': {
            backgroundColor: 'elevation.surface.hovered',
        },
        ':last-child': {
            borderBottom: 'none',
        },
    })

    const value: EstimationTargetContextType = {
        scope: target.scope,
        goals: goals,
        goalTier: goalTier,
        isCollapsed: isCollapsed,
        clearGoals: clearGoals,
        updateValues: updateValues,
        getTotalDPPoints: getTotalDPPoints,
        toogleCollapse: () => setIsCollapsed((prev) => !prev),
    }

    return (
        <EvalGCContext.Provider value={value}>
            {!simplified && mode === EstimationMode.PORTFOLIO_ITEMS ? (
                <TargetLabelContainer />
            ) : (
                !simplified && <GoalCollectionLabelContainer />
            )}
            {!isCollapsed &&
                (goals.length === 0 ? (
                    <Box
                        key={`${goalTier.id}-row`}
                        xcss={xcss({
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        })}
                    >
                        <EmptyState
                            header="No Goals"
                            description={`${goalTier.name} has no goals and will therefore not be evaluated`}
                            primaryAction={
                                <Button
                                    onClick={() =>
                                        setIsCollapsed((prev) => !prev)
                                    }
                                >
                                    Collapse
                                </Button>
                            }
                        />
                    </Box>
                ) : (
                    <Grid
                        xcss={xcss({
                            width: 'max-content',
                            maxWidth: '100%',
                            gridTemplateColumns: simplified
                                ? '300px 1fr'
                                : '150px 1fr',
                            overflow: 'hidden',
                        })}
                    >
                        <GoalLabelContainer simplified={simplified} />
                        <PointsFieldContainer index={index}>
                            {goals.map((goal) => {
                                return (
                                    <Box
                                        key={`${goal.id}-row`}
                                        xcss={calcRowStyle}
                                    >
                                        {(simplified
                                            ? upperGoals.slice(currentStep, currentStep!! + 1)
                                            : upperGoals
                                        ).map((upperGoal) => {
                                            return (
                                                <EstimationField
                                                    key={`${upperGoal.id}-${goal.id}-cell`}
                                                    goal={goal}
                                                    upperGoal={upperGoal}
                                                    simplified={simplified}
                                                />
                                            )
                                        })}
                                    </Box>
                                )
                            })}
                        </PointsFieldContainer>
                    </Grid>
                ))}
        </EvalGCContext.Provider>
    )
}
