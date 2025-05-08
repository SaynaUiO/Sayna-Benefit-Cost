import { useNavigate, useParams } from 'react-router'
import { useContext, useEffect, useState } from 'react'
import { useAppContext } from '../../Contexts/AppContext'
import { useAPI } from '../../Contexts/ApiContext'
import { useAlert } from '../../Contexts/AlertContext'
import { Loading } from '../../Components/Common/Loading'

export const ChangeRanking = () => {
    const { goal_collection_id_1, goal_collection_id_2 } = useParams()

    const { showAlert } = useAlert()

    const navigation = useNavigate()
    const [ids, setIDs] = useState<string[] | undefined>(undefined)
    const [scope] = useAppContext()
    const api = useAPI()

    useEffect(() => {
        if (goal_collection_id_1 && goal_collection_id_2) {
            try {
                setIDs([goal_collection_id_1, goal_collection_id_2])
                showAlert({
                    title: `Change Ranking`,
                    body: `Are you sure you want to change the ranking of these two goal collections?`,
                    confirmText: 'Change Ranking',
                    onConfirm: async () => onConfirm(),
                    onCancel: () => navigation('..'),
                })
            } catch (error) {
                console.error(error)
            }
        } else {
            console.error('error')
        }
    }, [])

    const onConfirm = () => {
        if (scope && ids) {
            return api.goalCollection
                .changeRanking(scope.id, ids[0], ids[1])
                .then((response) => {
                    navigation('..')
                })
                .catch((error) => {
                    console.error(error)
                })
        } else {
            navigation('..')
        }
    }
    return <Loading />
}
