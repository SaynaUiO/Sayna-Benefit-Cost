import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useAPI } from '../../../Contexts/ApiContext'
import { useEffect } from 'react'
import { useFlags } from '@atlaskit/flag'
import { useAlert } from '../../../Contexts/AlertContext'
import SuccessIcon from '@atlaskit/icon/glyph/check-circle'
import ErrorIcon from '@atlaskit/icon/glyph/error'
import { R400 } from '@atlaskit/theme/colors'
import { G300 } from '@atlaskit/theme/colors'
import { token } from '@atlaskit/tokens'
import { useAppContext } from '../../../Contexts/AppContext'
import { GoalTableItem } from '../../../Models/GoalStructureModel'

type DeleteGoalProps = {
    items: GoalTableItem[]
    goal_tier_id: string
    goal_id: string | undefined
    close: () => void
    refresh: () => void
}
export const DeleteGoal = (props: DeleteGoalProps) => {
    const { items, goal_tier_id, goal_id, close, refresh } = props

    const key = items.find((item) => item.id === goal_id)?.key

    const api = useAPI()
    const [scope] = useAppContext()
    const location = useLocation()
    const navigate = useNavigate()
    const { showAlert } = useAlert()
    const { showFlag } = useFlags()

    const closeTab = (refresh: boolean) => {
        if (refresh) props.refresh()
        close()
    }

    useEffect(() => {
        if (goal_tier_id && goal_id && key) {
            showAlert({
                title: `Delete ${key}`,
                body: `Are you sure you want to delete ${key}?`,
                confirmText: 'Delete',
                onCancel: () => closeTab(false),
                onConfirm: () => deleteGC(),
            })
        } else {
            closeTab(false)
        }
    }, [goal_tier_id, key])

    const deleteGC = async () => {
        if (goal_tier_id && goal_id && key) {
            await api.goal
                .delete(scope.id, goal_tier_id, goal_id)
                .then(() => {
                    closeTab(true)
                    showFlag({
                        title: 'Deleted',
                        description: `Successfully deleted ${key}`,
                        isAutoDismiss: true,
                        icon: (
                            <SuccessIcon
                                primaryColor={token('color.icon.success', G300)}
                                label="Success"
                            />
                        ),
                    })
                })
                .catch(() => {
                    closeTab(true)
                    showFlag({
                        title: 'Error',
                        description: `Could not delete ${key}`,
                        isAutoDismiss: true,
                        icon: (
                            <ErrorIcon
                                primaryColor={token('color.icon.danger', R400)}
                                label="Success"
                            />
                        ),
                    })
                })
        } else {
            closeTab(false)
        }
    }
    return <div />
}
