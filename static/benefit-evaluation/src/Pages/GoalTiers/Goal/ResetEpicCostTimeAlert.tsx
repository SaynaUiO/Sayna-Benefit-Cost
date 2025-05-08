import React, { useEffect } from 'react'
import { useAlert } from '../../../Contexts/AlertContext'
import { useAPI } from '../../../Contexts/ApiContext'
import { GoalTier, GoalTableItem } from '../../../Models'
import { useAppContext } from '../../../Contexts/AppContext'

type ResetEpicCostAlertProps = {
    setItems: React.Dispatch<React.SetStateAction<GoalTableItem[]>>
    close: () => void
}

const ResetEpicCostTimeAlert = (props: ResetEpicCostAlertProps) => {
    const { setItems, close } = props

    const { showAlert } = useAlert()
    const api = useAPI()
    const [scope] = useAppContext()

    useEffect(() => {
        showAlert({
            title: `Reset Cost and Time`,
            body: `Are you sure you want to reset all costs and times? Note that this is not reversible.`,
            confirmText: 'Reset',
            onCancel: () => close(),
            onConfirm: async () => {
                await api.issue.resetCostTime()
                setItems((prevItems) =>
                    prevItems.map((item) => ({
                        ...item,
                        issueCost: { cost: 0, time: 0, balanced_points: 0 },
                    }))
                )
                close()
            },
        })
    }, [])

    return <></>
}
export default ResetEpicCostTimeAlert
