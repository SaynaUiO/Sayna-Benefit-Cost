import { ReactNode } from 'react'
import { Goal, Relation, Weight, balancedPointsEnum } from '../Models'

export const calculateBPandTP = (
    goal: Goal,
    criteriaGoals: Goal[],
    relation: Relation,
    pointsToDistribution: number
): { tp: number; bp: Weight } => {
    /* Calculate balancedPoints */
    let totalPoints = 0
    let balancedPoints: Weight = {
        type: balancedPointsEnum.WEIGHT,
        value: 0,
        postFix: '%',
    }
    for (const criteriaGoal of criteriaGoals) {
        if (relation.balance) {
            if (relation.method === balancedPointsEnum.WEIGHT) {
                balancedPoints.value += +(
                    (goal.distributedPoints![criteriaGoal.id] *
                        criteriaGoal.balancedPoints!.value!) /
                    100
                ).toFixed(2)
            } else {
                balancedPoints.value += +(
                    goal.distributedPoints![criteriaGoal.id] *
                    (criteriaGoal.balancedPoints!.value / relation.total!)
                ).toFixed(2)
            }
        }
        totalPoints += goal.distributedPoints![criteriaGoal.id]
    }
    if (!relation.balance) {
        balancedPoints.value = +(
            (totalPoints / (pointsToDistribution * criteriaGoals.length)) *
            100
        ).toFixed(2)
    }
    return { tp: totalPoints, bp: balancedPoints }
}

type HideScrollBarProps = {
    scrollRef: React.RefObject<HTMLDivElement>
    children: ReactNode
    style: React.CSSProperties
    onScroll: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void
}

export const HideScrollBar = ({
    scrollRef,
    style,
    onScroll,
    children,
}: HideScrollBarProps) => {
    return (
        <div
            className="hideScrollBar"
            style={style}
            ref={scrollRef}
            onScroll={onScroll}
        >
            {children}
        </div>
    )
}
