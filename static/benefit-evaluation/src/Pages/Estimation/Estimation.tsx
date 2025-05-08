import { useEffect, useMemo, useState } from 'react'
import { SelectGoalCollections } from '../../Components/Estimation/SelectGoalCollections'
import { Loading } from '../../Components/Common/Loading'
import Button from '@atlaskit/button'
import EmptyState from '@atlaskit/empty-state'
import { useNavigate } from 'react-router-dom'
import { useAPI } from '../../Contexts/ApiContext'
import { useAppContext } from '../../Contexts/AppContext'
import PageHeader from '@atlaskit/page-header'
import { EstimationContainer } from './EstimationContainer'
import { EstimationContextProvider } from './EstimationContext'
import { GoalTier, EstimationMode, EstimationProps } from '../../Models'

export const Estimation = () => {
    const [isLoading, setLoading] = useState<boolean>(false)
    const [goalTier, setGoalTier] = useState<GoalTier>()
    const [upperGoalTier, setUpperGoalTier] = useState<GoalTier>()
    const [estimationProps, setEstimationProps] =
        useState<EstimationProps<EstimationMode>>()
    const [error, setError] = useState<string>()

    const navigate = useNavigate()
    const [scope] = useAppContext()
    const api = useAPI()

    useEffect(() => {
        let isMounted = true
        if (goalTier && upperGoalTier) {
            setEstimationProps(undefined)
            setLoading(true)
            api.estimation
                .getEstimationProps(goalTier, upperGoalTier)
                .then((response) => {
                    if (isMounted) {
                        setEstimationProps(response)
                    }
                    setLoading(false)
                })
                .catch((error) => {
                    if (error.message === 'string') {
                        setError(error.message)
                    } else {
                        setError('Something went wrong, please try again later')
                    }
                })
        }
        return () => {
            isMounted = false
        }
    }, [goalTier, upperGoalTier])

    const displayError = useMemo(() => {
        if (error && goalTier && upperGoalTier) {
            if (error.includes(upperGoalTier.name)) {
                return (
                    <EmptyState
                        header={`${upperGoalTier.name} has no goals`}
                        description="You can add goals by clicking the button below"
                        headingLevel={2}
                        primaryAction={
                            <Button
                                appearance="primary"
                                onClick={() =>
                                    navigate(
                                        `..//${upperGoalTier.id}/create-goal`
                                    )
                                }
                            >
                                Add Goals
                            </Button>
                        }
                    />
                )
            } else if (error.includes(goalTier.name)) {
                if (goalTier.scopeId === scope.id) {
                    return (
                        <EmptyState
                            header={`${goalTier.name} has no goals`}
                            description="You can add goals by clicking the button below"
                            headingLevel={2}
                            primaryAction={
                                <Button
                                    appearance="primary"
                                    onClick={() =>
                                        navigate(`../goal-structure`)
                                    }
                                >
                                    Add Goals
                                </Button>
                            }
                        />
                    )
                } else {
                    return (
                        <EmptyState
                            header={`${goalTier.name} has no goals`}
                            description="To evaluate this goal collection, you need to add goals to it"
                        />
                    )
                }
            }
        }
        return (
            <EmptyState
                header={`Something went wrong, or there are ny goals`}
            />
        )
    }, [error])

    return (
        <>
            <PageHeader
                bottomBar={
                    <SelectGoalCollections
                        isDisabled={isLoading}
                        onChange={(value) => {
                            const { goalTier, upperGoalTier } = value.value
                            setGoalTier(goalTier)
                            setUpperGoalTier(upperGoalTier)
                        }}
                    />
                }
            >
                Estimation
            </PageHeader>
            {error ? (
                displayError
            ) : (
                <>
                    {estimationProps && (
                        <EstimationContextProvider
                            estimationProps={estimationProps}
                        >
                            <EstimationContainer />
                        </EstimationContextProvider>
                    )}
                    {isLoading && <Loading />}
                </>
            )}
        </>
    )
}
