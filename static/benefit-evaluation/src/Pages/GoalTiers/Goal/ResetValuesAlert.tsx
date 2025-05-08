import { useEffect } from 'react'
import { useAlert } from '../../../Contexts/AlertContext'
import { useAPI } from '../../../Contexts/ApiContext'
import { GoalTier } from '../../../Models/GoalTierModel'
import { useAppContext } from '../../../Contexts/AppContext'

type ResetValuesAlertProps = {
    goalTier: GoalTier
    close: () => void
    refresh: () => void
}

const ResetValuesAlert = (props: ResetValuesAlertProps) => {
    const { goalTier, close, refresh } = props

    const { showAlert } = useAlert()
    const api = useAPI()
    const [scope] = useAppContext()

    const closeTab = (refresh: boolean) => {
        if (refresh) props.refresh()
        close()
    }

    useEffect(() => {
        showAlert({
            title: `Reset Goal Values`,
            body: `Are you sure you want to reset all values? Note that this is not reversible.`,
            confirmText: 'Reset',
            onCancel: () => closeTab(false),
            onConfirm: async () => {
                api.goal
                    .resetAllPoints(scope.id, goalTier.id)
                    .then(() => closeTab(true))
            },
        })
    }, [])

    return <></>
}
export default ResetValuesAlert
