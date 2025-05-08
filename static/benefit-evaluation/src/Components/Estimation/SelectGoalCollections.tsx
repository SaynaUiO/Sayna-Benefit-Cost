import Select from '@atlaskit/select'
import { Stack, Grid, xcss } from '@atlaskit/primitives'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import EmptyState from '@atlaskit/empty-state'
import Button from '@atlaskit/button'
import { useAppContext } from '../../Contexts/AppContext'
import { useAPI } from '../../Contexts/ApiContext'
import { Label } from '@atlaskit/form'
import HipchatChevronDoubleUpIcon from '@atlaskit/icon/glyph/hipchat/chevron-double-up'
import HipchatChevronDoubleDownIcon from '@atlaskit/icon/glyph/hipchat/chevron-double-down'
import Tooltip from '@atlaskit/tooltip'
import { GoalTier } from '../../Models/GoalTierModel'
import { GoalTierTypeEnum } from '../../Models'

export type GoalTierOption = {
    label: string
    value: {
        goalTier: GoalTier
        upperGoalTier: GoalTier
    }
}

export type SelectGoalCollectionsProps = {
    isDisabled?: boolean
    onChange: (value: GoalTierOption) => void
}

export const SelectGoalCollections = ({
    onChange,
    isDisabled,
}: SelectGoalCollectionsProps) => {
    const [options, setOptions] = useState<GoalTierOption[]>()
    const [isLoading, setLoading] = useState<boolean>(true)
    const [selectedOption, setSelectedOption] = useState<GoalTierOption>()

    const { goal_tier_type, goal_tier_id, upper_goal_tier_id } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const api = useAPI()
    const [scope] = useAppContext()

    const ChooseGoalTier = (goalTier: GoalTier, upperGoalTier: GoalTier) => {
        navigate(
            `../estimation/${goalTier.type}/${goalTier.id}/${upperGoalTier.id}`,
            { replace: true }
        )
    }

    const fetch = async (): Promise<GoalTierOption[]> => {
        return await api.goalTier
            .getAll(scope.id, scope.type)
            .then((goalTiers) => {
                const estimationOptions: GoalTierOption[] = []
                for (let index = 0; index < goalTiers.length - 1; index++) {
                    const goalTier = goalTiers[index]
                    const upperGoalTier = goalTiers[index + 1]
                    estimationOptions.push({
                        label: goalTier.name + ' - ' + upperGoalTier.name,
                        value: {
                            goalTier: goalTier,
                            upperGoalTier: upperGoalTier,
                        },
                    })
                }
                estimationOptions.reverse()
                console.debug(estimationOptions)
                return estimationOptions
            })
            .catch((error) => {
                console.error(error)
                return []
            })
    }

    useEffect(() => {
        console.debug('useEffect')
        let isMounted = true
        fetch().then((options) => {
            console.debug('awaiting results')
            if (isMounted) setOptions(options)
        })
        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        if (options) {
            if (options.length > 0) {
                const option = options.find(
                    (option) =>
                        `${option.value.goalTier.type}` === goal_tier_type &&
                        `${option.value.goalTier.id}` === goal_tier_id &&
                        `${option.value.upperGoalTier.id}` ===
                            upper_goal_tier_id
                )
                if (option) {
                    console.debug('Select option with parameters')
                    setSelectedOption(option)
                    setLoading(false)
                    onChange(option)
                } else if (options.length === 1) {
                    console.debug('Selecting only option')
                    const { goalTier, upperGoalTier: upperGoalTier } =
                        options[0].value
                    ChooseGoalTier(goalTier, upperGoalTier)
                    setLoading(false)
                } else {
                    console.debug('No option selected')
                    setLoading(false)
                }
            } else {
                console.debug('No options')
                setLoading(false)
            }
        }
    }, [options, location.pathname])

    const selectRankAboveCurrent = () => {
        if (options && selectedOption) {
            const index = options.findIndex(
                (option) => option === selectedOption
            )
            if (index !== 0) {
                const { goalTier, upperGoalTier } = options[index - 1].value
                ChooseGoalTier(goalTier, upperGoalTier)
            }
        } else if (options && options.length > 0) {
            const { goalTier, upperGoalTier } = options[0].value
            ChooseGoalTier(goalTier, upperGoalTier)
        }
    }

    const selectRankBelowCurrent = () => {
        if (options && selectedOption) {
            const index = options.findIndex(
                (option) => option === selectedOption
            )
            if (index !== options.length - 1) {
                const { goalTier, upperGoalTier } = options[index + 1].value
                ChooseGoalTier(goalTier, upperGoalTier)
            }
        } else if (options && options.length > 0) {
            const { goalTier, upperGoalTier } =
                options[options.length - 1].value
            ChooseGoalTier(goalTier, upperGoalTier)
        }
    }

    return (
        <>
            <Stack
                xcss={xcss({
                    zIndex: 'layer',
                    position: 'relative',
                    marginTop: '1rem',
                    marginBottom: '1rem',
                    maxWidth: '500px',
                })}
                alignInline="center"
            >
                <Label htmlFor="">
                    Select which goal tiers you want to evaluate
                </Label>
                <Grid
                    xcss={xcss({ width: '100%' })}
                    templateColumns="32px 1fr 32px"
                    alignItems="center"
                    columnGap="space.400"
                >
                    <Tooltip content="Evaluate One Rank Down">
                        <Button
                            onClick={() => selectRankBelowCurrent()}
                            iconBefore={
                                <HipchatChevronDoubleDownIcon label="Rank down" />
                            }
                            isDisabled={
                                isLoading ||
                                isDisabled ||
                                !options ||
                                options.length === 0 ||
                                selectedOption === options![options!.length - 1]
                            }
                        />
                    </Tooltip>
                    <Select
                        inputId="single-select-example"
                        className="single-select"
                        classNamePrefix="react-select"
                        isLoading={isLoading}
                        value={selectedOption}
                        autoFocus
                        onChange={(value) => {
                            const option = value as GoalTierOption
                            const { goalTier, upperGoalTier } = option.value
                            ChooseGoalTier(goalTier, upperGoalTier)
                        }}
                        isDisabled={isLoading || isDisabled}
                        options={options}
                        placeholder={
                            isLoading
                                ? 'Loading...'
                                : options && options.length > 0
                                ? 'Select which tiers to evaluate'
                                : 'No goal collections found'
                        }
                    />
                    <Tooltip content="Evaluate One Rank Up">
                        <Button
                            onClick={() => selectRankAboveCurrent()}
                            iconBefore={
                                <HipchatChevronDoubleUpIcon label="Rank up" />
                            }
                            isDisabled={
                                isLoading ||
                                isDisabled ||
                                !options ||
                                options.length === 0 ||
                                selectedOption === options![0]
                            }
                        />
                    </Tooltip>
                </Grid>
                {selectedOption && (
                    <p>
                        Assign benefit points to the{' '}
                        {Number(goal_tier_type) === GoalTierTypeEnum.ISSUE_TYPE
                            ? `epics`
                            : `${selectedOption?.value.goalTier.name} goals`}{' '}
                        indicating how much each{' '}
                        {Number(goal_tier_type) === GoalTierTypeEnum.ISSUE_TYPE
                            ? 'epic'
                            : 'goal'}{' '}
                        contributes to the "
                        {selectedOption?.value.upperGoalTier.name}" goals on the
                        tier above.
                    </p>
                )}
            </Stack>
            {options && options.length === 0 && (
                <EmptyState
                    header="Could not find any goal collections"
                    description="You can create goals collections by clicking the button below"
                    headingLevel={2}
                    primaryAction={
                        <Button
                            appearance="primary"
                            onClick={() =>
                                navigate(
                                    '../goal-structure/create-goal-collection'
                                )
                            }
                        >
                            Create Goal Collections
                        </Button>
                    }
                />
            )}
        </>
    )
}
