import { token } from '@atlaskit/tokens'
import { ReactNode, useMemo, useState } from 'react'
import Button from '@atlaskit/button'
import EditorPanelIcon from '@atlaskit/icon/glyph/editor/panel'
import Popup from '@atlaskit/popup'
import React from 'react'
import { Inline, Stack, xcss } from '@atlaskit/primitives'
import Heading from '@atlaskit/heading'
import {
    Goal,
    GoalTypeEnum,
    PortfolioItemGoal,
    balancedPointsEnum,
} from '../../Models'
import Lozenge from '@atlaskit/lozenge'
import { useEstimation } from '../../Pages/Estimation/EstimationContext'

type GoalPopupProps = {
    goal: Goal | Goal | PortfolioItemGoal
    isUpperGoal?: true
}

export const GoalPopup = ({ goal, isUpperGoal }: GoalPopupProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const { upperGoals, relation } = useEstimation()

    const totalPoints = useMemo(() => {
        let totalPoints = 0
        for (const upperGoal of upperGoals) {
            totalPoints += goal.distributedPoints?.[upperGoal.id] || 0
        }
        return totalPoints
    }, [goal.distributedPoints, upperGoals])

    const contentStyles: React.CSSProperties = {
        padding: token('space.200', '16px'),
        maxWidth: '200px',
    }

    const PropertyStack = ({ children }: { children: ReactNode }) => (
        <Stack space="space.050" alignInline="start">
            {children}
        </Stack>
    )

    const properties = () => {
        const properties = []
        if (!isUpperGoal) {
            properties.push(
                <PropertyStack key={goal.scopeId + goal.id + 'pd'}>
                    <h5>Points Distributed</h5>
                    <Lozenge appearance="inprogress" isBold>
                        {totalPoints}
                    </Lozenge>
                </PropertyStack>
            )
        }
        if ('portfolioItemPoints' in goal) {
            properties.push(
                <PropertyStack key={goal.scopeId + goal.id + 'pip'}>
                    <h5>Portfolio Item Contribution</h5>
                    <Lozenge isBold>
                        {goal.portfolioItemPoints.toFixed(2)}%
                    </Lozenge>
                </PropertyStack>
            )
        }

        if (
            goal.balancedPoints &&
            ((isUpperGoal && relation.balance) || !isUpperGoal)
        ) {
            properties.push(
                <PropertyStack key={goal.scopeId + goal.id + 'bp'}>
                    <h5>
                        {relation.balance &&
                        relation.method === balancedPointsEnum.WEIGHT
                            ? 'Weight'
                            : goal.type === GoalTypeEnum.ISSUE
                            ? 'Benefit Points'
                            : 'Balanced Points'}
                    </h5>
                    <Lozenge appearance="new" isBold>
                        {`${Number(goal.balancedPoints!.value).toLocaleString(
                            'en-US'
                        )} ${isUpperGoal ? goal.balancedPoints!.postFix : ''}`}
                    </Lozenge>
                </PropertyStack>
            )
        }
        return properties
    }

    return (
        <Inline alignInline="center" alignBlock="center" spread="space-between">
            <Heading level="h400">{goal.key}</Heading>
            <Popup
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                placement="bottom-start"
                zIndex={9999}
                content={() => (
                    <div style={contentStyles}>
                        <Stack>
                            <h4>{goal.key}</h4>
                            <Stack
                                xcss={xcss({ marginTop: '10px' })}
                                alignInline="start"
                                alignBlock="center"
                                space="space.100"
                            >
                                {properties()}
                            </Stack>
                            <p>{goal.description}</p>
                        </Stack>
                    </div>
                )}
                trigger={(triggerProps) => (
                    <Button
                        {...triggerProps}
                        iconBefore={<EditorPanelIcon label="Goal Info" />}
                        appearance="subtle"
                        isSelected={isOpen}
                        onClick={() => setIsOpen(!isOpen)}
                    />
                )}
            />
        </Inline>
    )
}
