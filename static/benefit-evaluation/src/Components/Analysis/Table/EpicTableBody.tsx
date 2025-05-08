import { RowType } from '@atlaskit/dynamic-table/dist/types/types'
import Lozenge from '@atlaskit/lozenge'
import Tooltip from '@atlaskit/tooltip'
import { GoalTableItem, balancedPointsEnum } from '../../../Models'

export const EpicTableBody = (
    items: GoalTableItem[],
    showMonetary: boolean,
    pointValue: number,
    costValue: number,
    postfix: string,
    upperIsMonetary: boolean
): RowType[] => {
    let rows: RowType[] = items.map((item, _): RowType => {
        const benefit: number = showMonetary
            ? Math.round(item.balancedPoints!!.value * pointValue * 100) / 100
            : Math.round(item.balancedPoints!!.value * 100) / 100

        const cost: number = showMonetary
            ? upperIsMonetary
                ? item.issueCost!!.cost
                : Math.round(
                      costValue *
                          (item.issueCost!!.balanced_points || 0) *
                          100 *
                          100
                  ) / 100
            : Math.round(
                  (item.issueCost!!.balanced_points || 1 / items.length) *
                      100 *
                      100
              ) / 100

        const benefitCost = (benefit / cost).toFixed(2)

        return {
            key: `${item.id}`,
            isHighlighted: false,
            cells: [
                {
                    key: item.key,
                    content: item.key,
                },
                {
                    key: item.description,
                    content: item.description,
                },
                {
                    key: `${item.id}-status`,
                    content: (
                        <Lozenge appearance="inprogress">
                            {item.status!.name}
                        </Lozenge>
                    ),
                },
                {
                    key: `time-${item.issueCost?.time || 0}`,
                    content: (
                        <Tooltip content={'Time'}>
                            <Lozenge appearance="inprogress">{`${
                                item.issueCost?.time || 0
                            }`}</Lozenge>
                        </Tooltip>
                    ),
                },
                {
                    key: `benefit-${item.balancedPoints?.value || 0}`,
                    content: item.balancedPoints ? (
                        <Tooltip content={'Benefit points'}>
                            <Lozenge appearance="new">{`${benefit.toLocaleString(
                                'en-US'
                            )} ${
                                item.balancedPoints.type ===
                                    balancedPointsEnum.MONETARY || showMonetary
                                    ? postfix
                                    : ''
                            }`}</Lozenge>
                        </Tooltip>
                    ) : (
                        <Lozenge appearance="default">NO ESTIMATES</Lozenge>
                    ),
                },
                {
                    key: `cost-${item.issueCost?.cost || 0}`,
                    content: (
                        <Tooltip content={'Cost'}>
                            <Lozenge appearance="removed">{`${cost.toLocaleString(
                                'en-US'
                            )} ${
                                item.balancedPoints!!.type ===
                                    balancedPointsEnum.MONETARY || showMonetary
                                    ? postfix
                                    : ''
                            }`}</Lozenge>
                        </Tooltip>
                    ),
                },
                {
                    key: `benefit-points-${benefitCost}`,
                    content: item.balancedPoints ? (
                        <Tooltip content={'Benefit/Cost'}>
                            <Lozenge appearance="success">
                                {Number(benefitCost).toLocaleString('en-US')}
                            </Lozenge>
                        </Tooltip>
                    ) : (
                        <Lozenge appearance="default">NO ESTIMATES</Lozenge>
                    ),
                },
            ],
        }
    })
    return rows
}
