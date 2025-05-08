import { HeadType } from '@atlaskit/dynamic-table/dist/types/types'
import { GoalTier, GoalTierTypeEnum } from '../../../Models/GoalTierModel'

export const EpicTableHead = (
    goalTier: GoalTier,
    isMonetary: boolean
): HeadType | undefined => {
    return {
        cells: [
            {
                key: 'name',
                content: 'Name',
                isSortable: true,
            },
            {
                key: 'description',
                content: 'Description',
                isSortable: true,
                shouldTruncate: true,
            },
            {
                key: 'status',
                content: 'Status',
                isSortable: true,
            },
            {
                key: 'time',
                content: 'Time',
                isSortable: true,
            },
            {
                key: 'balancedPoints',
                content:
                    goalTier.type === GoalTierTypeEnum.ISSUE_TYPE
                        ? isMonetary
                            ? 'Benefit'
                            : 'Benefit Points'
                        : goalTier.type === GoalTierTypeEnum.PORTFOLIO_ITEM
                        ? 'Portfolio Item Points'
                        : 'Weight',
                isSortable: true,
            },
            {
                key: 'cost',
                content: isMonetary ? 'Cost' : 'Cost Points',
                isSortable: true,
            },
            {
                key: 'benefitCost',
                content: isMonetary ? 'Benefit/Cost' : 'BP/CP',
                isSortable: true,
            },
        ],
    }
}
