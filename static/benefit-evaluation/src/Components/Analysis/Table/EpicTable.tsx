import { useCallback } from 'react'
import { GoalTier, GoalTableItem } from '../../../Models'
import { Outlet, useNavigate } from 'react-router-dom'
import Button from '@atlaskit/button'
import DynamicTable from '@atlaskit/dynamic-table'
import EmptyState from '@atlaskit/empty-state'
import { EpicTableHead } from './EpicTableHead'
import { EpicTableBody } from './EpicTableBody'

type EpicTableProps = {
    goalTier: GoalTier
    items: GoalTableItem[]
    loading: boolean
    showMonetary: boolean
    pointValue: number
    upperIsMonetary: boolean
    costValue: number
    postfix: string
}

export const EpicTable = ({
    goalTier,
    items,
    loading,
    showMonetary,
    pointValue,
    upperIsMonetary,
    costValue,
    postfix
}: EpicTableProps) => {
    const navigation = useNavigate()

    // * useCallbacks
    const head = useCallback(() => {
        return EpicTableHead(goalTier, showMonetary)
    }, [items, showMonetary])

    const rows = useCallback(() => {
        return EpicTableBody(items, showMonetary, pointValue, costValue, postfix, upperIsMonetary)
    }, [items, showMonetary, pointValue, costValue, postfix, upperIsMonetary])

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
            <DynamicTable
                head={head()}
                rows={rows()}
                page={1}
                defaultSortKey="benefitCost"
                defaultSortOrder="DESC"
                isRankable={false}
                loadingSpinnerSize="large"
                isLoading={loading}
                emptyView={
                    goalTier.name === 'Epics' ? (
                        <EmptyState
                            header="No epics"
                            description={
                                'The selected issue type does not have any issues' +
                                ' Go to issues to add issues of this issue type, or change the issue type in here'
                            }
                            headingLevel={2}
                            primaryAction={SettingsButton()}
                        />
                    ) : (
                        <EmptyState
                            header="No goals"
                            description="You can add goals by going to the Goal Structure"
                            headingLevel={2}
                        />
                    )
                }
            />
            <Outlet />
        </>
    )
}
