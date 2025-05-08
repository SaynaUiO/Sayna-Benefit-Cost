import Button from '@atlaskit/button'
import DropdownMenu, {
    DropdownItemGroup,
    DropdownItem,
} from '@atlaskit/dropdown-menu'
import { RowType } from '@atlaskit/dynamic-table/dist/types/types'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../../Contexts/AppContext'
import MoreIcon from '@atlaskit/icon/glyph/more'
import { GoalTier, GoalTierTypeEnum } from '../../Models/GoalTierModel'

export const GoalTierRows = (
    goalTiers: GoalTier[],
    isRankable: boolean,
    setSelectedOption: any,
    setShowEditGoalCollection: any,
    setEditGoalCollection: any,
    setShowDeleteGoalCollection: any,
    setDeleteGoalCollection: any
): RowType[] | undefined => {
    const navigate = useNavigate()
    const [scope] = useAppContext()

    let rows: RowType[] = goalTiers.map(
        (goalTier: GoalTier, index: number): RowType => ({
            key: `${goalTier.id}`,
            cells: [
                {
                    key: index,
                    content: goalTiers.length - index,
                },
                {
                    key: goalTier.name,
                    content: goalTier.name,
                },
                {
                    key: goalTier.description,
                    content: goalTier.description,
                },
                {
                    key: 'MoreDropdown',
                    content: (
                        <DropdownMenu
                            trigger={({ triggerRef, ...props }) => (
                                <Button
                                    {...props}
                                    iconBefore={<MoreIcon label="more" />}
                                    ref={triggerRef}
                                />
                            )}
                        >
                            <DropdownItemGroup>
                                <DropdownItem
                                    onClick={() => {
                                        setSelectedOption({
                                            label: `Tier ${
                                                goalTiers.length - index
                                            } - ${goalTier.name}`,
                                            value: goalTier,
                                        })
                                    }}
                                >
                                    View
                                </DropdownItem>
                                {goalTier.type ===
                                    GoalTierTypeEnum.GOAL_COLLECTION && (
                                    <>
                                        <DropdownItem
                                            onClick={() => {
                                                setShowEditGoalCollection(true)
                                                setEditGoalCollection(goalTier)
                                            }}
                                        >
                                            Edit
                                        </DropdownItem>
                                        <DropdownItem
                                            onClick={() => {
                                                setShowDeleteGoalCollection(
                                                    true
                                                )
                                                setDeleteGoalCollection(
                                                    goalTier
                                                )
                                            }}
                                        >
                                            Delete
                                        </DropdownItem>
                                    </>
                                )}
                            </DropdownItemGroup>
                        </DropdownMenu>
                    ),
                },
            ],
        })
    )
    if (isRankable) rows = rows.filter((row: RowType) => row.key !== `-1`)
    return rows
}
