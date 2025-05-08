import Button, { ButtonGroup } from '@atlaskit/button'
import { useState, useEffect, useCallback } from 'react'
import { Outlet, useNavigate } from 'react-router'
import EmptyState from '@atlaskit/empty-state'
import DynamicTable from '@atlaskit/dynamic-table'
import { useAppContext } from '../../Contexts/AppContext'
import { useAPI } from '../../Contexts/ApiContext'
import { GoalTableHead } from './GoalTableHead'
import { GoalTableRows } from './GoalTableRows'
import { useLocation } from 'react-router-dom'
import BitbucketCompareIcon from '@atlaskit/icon/glyph/bitbucket/compare'
import { Box, xcss } from '@atlaskit/primitives'
import {
    Scope,
    GoalTier,
    GoalTierTypeEnum,
    GoalTableItem,
    GoalTableItemTypeEnum,
    Goal,
} from '../../Models'
import { AdminGoal } from '../../Pages/GoalTiers/Goal/AdminGoal'
import { DeleteGoal } from '../../Pages/GoalTiers/Goal/DeleteGoal'
import { SetValues } from '../../Pages/GoalTiers/SetValues'
import { SetEpicCostTime } from '../../Pages/GoalTiers/SetEpicCostTime'
import ResetValuesAlert from '../../Pages/GoalTiers/Goal/ResetValuesAlert'
import ResetEpicCostTimeAlert from '../../Pages/GoalTiers/Goal/ResetEpicCostTimeAlert'

type GoalTableProps = {
    goalTier: GoalTier
    isHighestGoalTier: boolean,
    upperIsMonetary: boolean,
    postfix: string,
    onFetching: (fetching: boolean) => void
}

export const GoalTable = ({ goalTier, isHighestGoalTier, upperIsMonetary, postfix,  onFetching }: GoalTableProps) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [items, setItems] = useState<GoalTableItem[]>([])
    const [goals, setGoals] = useState<Goal[]>([])

    const [scope] = useAppContext()
    const api = useAPI()
    const navigation = useNavigate()
    const location = useLocation()
    const refresh = location.state?.refresh

    const fetchItems = async (): Promise<GoalTableItem[]> => {
        switch (goalTier.type) {
            case GoalTierTypeEnum.PORTFOLIO_ITEM:
                return api.portfolioItem
                    .getAll(scope.id)
                    .then((response) => {
                        return response.map(
                            (portfolioItem: Scope): GoalTableItem => {
                                console.debug(portfolioItem)
                                return {
                                    ...portfolioItem,
                                    key: portfolioItem.name,
                                    goalCollectionId: goalTier.id,
                                    scopeType: portfolioItem.type,
                                    type: GoalTableItemTypeEnum.SCOPE,
                                    balancedPoints:
                                        portfolioItem.portfolioItemPoints,
                                }
                            }
                        )
                    })
                    .catch((error) => {
                        console.error(error)
                        return []
                    })
            case GoalTierTypeEnum.ISSUE_TYPE:
                return api.issue
                    .getAll()
                    .then(async (issues) => {
                        return issues.map((issue) => {
                            return {
                                ...issue,
                                type: GoalTableItemTypeEnum.ISSUE,
                            } as GoalTableItem
                        })
                    })
                    .catch((error) => {
                        console.error(error)
                        return []
                    })
            default: {
                const foundGoals: Goal[] = await api.goal.getAll(
                    scope.id,
                    goalTier.id
                )
                setGoals(foundGoals)

                return foundGoals.map(
                    (goal) =>
                        ({
                            ...goal,
                            type: GoalTableItemTypeEnum.GOAL,
                        } as GoalTableItem)
                )
            }
        }
    }

    useEffect(() => {
        onFetching(loading)
    }, [loading])

    useEffect(() => {
        let isMounted = true
        setLoading(true)
        setItems([])
        fetchItems().then((items) => {
            if (isMounted) {
                setItems(items)
                setLoading(false)
            }
        })
        return () => {
            isMounted = false
        }
    }, [goalTier, refresh])

    const head = useCallback(() => {
        return GoalTableHead(goalTier)
    }, [items])

    const [goalButtonOpen, setGoalButtonOpen] = useState<boolean>(false)
    const [goalType, setGoalType] = useState<'create' | 'edit'>('create')
    const [itemId, setItemId] = useState<string | undefined>(undefined)
    const [deletePaneOpen, setDeletePaneOpen] = useState<boolean>(false)
    const [valuesTabOpen, setValuesTabOpen] = useState<boolean>(false)
    const [epicCostTimeOpen, setEpicCostTimeOpen] = useState<boolean>(false)
    const [resetValuesTabOpen, setResetValuesTabOpen] = useState<boolean>(false)
    const [resetEpicCostTabOpen, setResetEpicCostTabOpen] =
        useState<boolean>(false)

    const rows = useCallback(() => {
        return GoalTableRows(
            goalTier,
            items,
            setGoalButtonOpen,
            setGoalType,
            setItemId,
            setDeletePaneOpen
        )
    }, [items])

    const NewGoalButton = () => {
        return (
            <Button
                appearance="primary"
                onClick={() => {
                    setGoalType('create')
                    setGoalButtonOpen(true)
                }}
            >
                New Goal
            </Button>
        )
    }

    const SetValuesTab = () => {
        return (
            <Button
                appearance="primary"
                iconBefore={<BitbucketCompareIcon label="compare" />}
                onClick={() => setValuesTabOpen(true)}
            >
                Set Goal Points
            </Button>
        )
    }
    const ResetValues = () => {
        return (
            <Button onClick={() => setResetValuesTabOpen(true)}>
                Reset Goal Values
            </Button>
        )
    }

    const SetCostEpics = () => {
        return (
            <Button
                appearance="primary"
                iconBefore={<BitbucketCompareIcon label="compare" />}
                onClick={() => setEpicCostTimeOpen(true)}
            >
                Set Time and Cost
            </Button>
        )
    }
    const ResetEpicCostTime = () => {
        return (
            <Button
                onClick={() => {
                    setResetEpicCostTabOpen(true)
                }}
            >
                Reset Time and Cost
            </Button>
        )
    }

    const AddPortfolioItem = () => {
        return (
            <Button
                appearance="primary"
                onClick={() => navigation('portfolio-item/add')}
            >
                Add Portfolio Items
            </Button>
        )
    }

    const SettingsButton = () => {
        return (
            <Button
                appearance="primary"
                onClick={() => navigation('../settings')}
            >
                Settings
            </Button>
        )
    }

    return (
        <>
            <Box xcss={xcss({ marginBottom: 'space.100' })}>
                <ButtonGroup>
                    {goalTier.type === GoalTierTypeEnum.GOAL_COLLECTION && (
                        <>
                            {NewGoalButton()}
                            {items && items.length > 0 && isHighestGoalTier && (
                                <>
                                    {SetValuesTab()}
                                    {ResetValues()}
                                </>
                            )}
                        </>
                    )}
                    {goalTier.type === GoalTierTypeEnum.PORTFOLIO_ITEM &&
                        AddPortfolioItem()}
                    {goalTier.type === GoalTierTypeEnum.ISSUE_TYPE && (
                        <>
                            {items && items.length > 0 && (
                                <>
                                    {SetCostEpics()}
                                    {ResetEpicCostTime()}
                                </>
                            )}
                        </>
                    )}
                </ButtonGroup>
            </Box>
            <DynamicTable
                head={head()}
                rows={rows()}
                page={1}
                defaultSortKey="name"
                defaultSortOrder="ASC"
                isRankable={false}
                loadingSpinnerSize="large"
                isLoading={loading}
                emptyView={
                    goalTier.type === GoalTierTypeEnum.ISSUE_TYPE ? (
                        <EmptyState
                            header="No epics"
                            description={
                                `The selected issue type (${goalTier.name}) does not have any issues` +
                                ' Go to issues to add issues of this issue type, or change the issue type in here'
                            }
                            headingLevel={2}
                            primaryAction={SettingsButton()}
                        />
                    ) : goalTier.name === 'Connections' ? (
                        <EmptyState
                            header="No connected projects or portfolios"
                            description="You can connect projects and portfolios by clicking the button below"
                            headingLevel={2}
                            primaryAction={AddPortfolioItem()}
                        />
                    ) : (
                        <EmptyState
                            header="No goals"
                            description="You can add goals by clicking the button below"
                            headingLevel={2}
                            primaryAction={NewGoalButton()}
                        />
                    )
                }
            />
            {/* Create goal and edit goal */}
            {goalButtonOpen && (
                <AdminGoal
                    mode={goalType}
                    close={() => setGoalButtonOpen(false)}
                    goal_tier_id={goalTier.id}
                    goal_id={itemId}
                    refresh={() => {
                        setLoading(true)
                        fetchItems().then((items) => {
                            setItems(items)
                            setLoading(false)
                        })
                    }}
                />
            )}

            {deletePaneOpen && (
                <DeleteGoal
                    items={items}
                    goal_tier_id={goalTier.id}
                    goal_id={itemId}
                    close={() => setDeletePaneOpen(false)}
                    refresh={() => {
                        setLoading(true)
                        fetchItems().then((items) => {
                            setItems(items)
                            setLoading(false)
                        })
                    }}
                />
            )}

            {valuesTabOpen && (
                <SetValues
                    goal_tier_id={goalTier.id}
                    goals={goals}
                    close={() => setValuesTabOpen(false)}
                    refresh={() => {
                        setLoading(true)
                        fetchItems().then((items) => {
                            setItems(items)
                            setLoading(false)
                        })
                    }}
                />
            )}

            {epicCostTimeOpen && (
                <SetEpicCostTime
                    items={items}
                    scopeId={scope.id}
                    scopeType={scope.type}
                    upperIsMonetary={upperIsMonetary}
                    postfix={postfix}
                    close={() => setEpicCostTimeOpen(false)}
                    refresh={() => {
                        setLoading(true)
                        fetchItems().then((items) => {
                            setItems(items)
                            setLoading(false)
                        })
                    }}
                />
            )}

            {resetValuesTabOpen && (
                <ResetValuesAlert
                    goalTier={goalTier}
                    close={() => setResetValuesTabOpen(false)}
                    refresh={() => {
                        setLoading(true)
                        fetchItems().then((items) => {
                            setItems(items)
                            setLoading(false)
                        })
                    }}
                />
            )}

            {resetEpicCostTabOpen && (
                <ResetEpicCostTimeAlert
                    setItems={setItems}
                    close={() => setResetEpicCostTabOpen(false)}
                />
            )}
            <Outlet />
        </>
    )
}
