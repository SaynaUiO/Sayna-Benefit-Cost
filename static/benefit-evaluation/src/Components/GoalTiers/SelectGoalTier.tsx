import Select from '@atlaskit/select'
import { Stack, Grid, xcss } from '@atlaskit/primitives'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EmptyState from '@atlaskit/empty-state'
import Button from '@atlaskit/button'
import { ScopeTypeEnum, useAppContext } from '../../Contexts/AppContext'
import { Label } from '@atlaskit/form'
import HipchatChevronDoubleUpIcon from '@atlaskit/icon/glyph/hipchat/chevron-double-up'
import HipchatChevronDoubleDownIcon from '@atlaskit/icon/glyph/hipchat/chevron-double-down'
import Tooltip from '@atlaskit/tooltip'
import { useFlags } from '@atlaskit/flag'
import InfoIcon from '@atlaskit/icon/glyph/info'
import { B300 } from '@atlaskit/theme/colors'
import { token } from '@atlaskit/tokens'
import { GoalTier } from '../../Models/GoalTierModel'
import { SpotlightTarget } from '@atlaskit/onboarding'

type option = {
    label: string
    value: GoalTier
}

export type SelectGoalCollectionProps = {
    isDisabled?: boolean
    onChange: (value: option) => void
    selectedOption: option | undefined
    setSelectedOption: (value: option) => void
    goalTiers: GoalTier[]
}

export const SelectGoalTier = ({
    isDisabled,
    onChange,
    selectedOption,
    setSelectedOption,
    goalTiers,
}: SelectGoalCollectionProps) => {
    const [options, setOptions] = useState<option[]>()
    const [isLoading, setLoading] = useState<boolean>(true)

    const navigate = useNavigate()
    const [scope] = useAppContext()
    const { showFlag } = useFlags()

    const { goal_tier_type, goal_tier_id } = useParams()

    useEffect(() => {
        setOptions(
            goalTiers
                .slice()
                .reverse()
                .map((goalTier: GoalTier, index: number): option => {
                    return {
                        label: `Tier ${index + 1} – ${goalTier.name}`,
                        value: goalTier,
                    }
                })
                .reverse()
        )
    }, [goalTiers])

    const selectTierAbove = () => {
        if (options && selectedOption) {
            const index = options.findIndex(
                (option) => option === selectedOption
            )
            if (index !== 0) {
                onChange(options[index - 1])
                setSelectedOption(options[index - 1])
            }
        } else if (options && options.length > 0) {
            onChange(options[0])
            setSelectedOption(options[0])
        }
    }

    const selectTierBelow = () => {
        if (options && selectedOption) {
            const index = options.findIndex(
                (option) => option === selectedOption
            )
            if (index !== options.length - 1) {
                onChange(options[index + 1])
                setSelectedOption(options[index + 1])
            }
        } else if (options && options.length > 0) {
            onChange(options[options.length - 1])
            setSelectedOption(options[options.length - 1])
        }
    }

    useEffect(() => {
        if (options) {
            const option = options.find(
                (option) =>
                    `${option.value.type}` === goal_tier_type &&
                    `${option.value.id}` === goal_tier_id
            )
            if (option) {
                onChange(option)
                setLoading(false)
                setSelectedOption(option)
            } else if (options.length === 1) {
                onChange(options[0])
                setLoading(false)
            } else {
                setLoading(false)
            }
        }
    }, [options, goal_tier_type, goal_tier_id])

    // useEffect(() => {
    //     if (options && options.length === 1) {
    //         showFlag({
    //             icon: (
    //                 <InfoIcon
    //                     primaryColor={token('color.icon.information', B300)}
    //                     label="Info"
    //                 />
    //             ),
    //             title: `Could not find any Goal Collections`,
    //             description:
    //                 scope.type === ScopeTypeEnum.PORTFOLIO
    //                     ? 'To be able to do an estimation, you need to create at least one goal collection.'
    //                     : 'To be able to do an estimation, you need to create at least one goal collection.' +
    //                       ' This can be done by creating a goal collection for this project, or by creating or using a portfolio with at least one goal collection.' +
    //                       ' That portfolio then needs to be linked to this project.',
    //             actions: [
    //                 {
    //                     content: `Create Goal Collection`,
    //                     onClick: () => {
    //                         navigate('../goal-structure/create-goal-collection')
    //                     },
    //                 },
    //             ],
    //             isAutoDismiss: false,
    //         })
    //     }
    // }, [options])

    return (
        <>
            {options && options.length === 0 ? (
                ''
            ) : (
                <Stack
                    xcss={xcss({ marginBottom: '1rem', maxWidth: '500px' })}
                    alignInline="center"
                >
                    <Label htmlFor="">Select a Goal Tier</Label>
                    <Grid
                        xcss={xcss({ width: '100%' })}
                        templateColumns="32px 1fr 32px"
                        alignItems="center"
                        columnGap="space.400"
                    >
                        <Tooltip content="Select One Tier Below">
                            <Button
                                onClick={() => selectTierBelow()}
                                iconBefore={
                                    <HipchatChevronDoubleDownIcon label="Tier Below" />
                                }
                                isDisabled={
                                    isLoading ||
                                    isDisabled ||
                                    !options ||
                                    options.length === 0 ||
                                    selectedOption === options!.at(-1)
                                }
                            />
                        </Tooltip>
                        <SpotlightTarget name="set-costs-time">
                            <Select
                                inputID="single-select-example"
                                className="single-select"
                                classNamePrefix="react-select"
                                isDisabled={isLoading || isDisabled}
                                isLoading={isLoading}
                                value={selectedOption}
                                onChange={(value) => {
                                    const option = value as option
                                    onChange(option)
                                    setSelectedOption(option)
                                }}
                                options={options}
                                placeholder={
                                    isLoading
                                        ? 'Loading...'
                                        : options && options.length > 0
                                        ? 'Select Goal Tier'
                                        : 'No goal tiers found'
                                }
                            />
                        </SpotlightTarget>
                        <Tooltip content="Select One Tier Above">
                            <Button
                                onClick={() => selectTierAbove()}
                                iconBefore={
                                    <HipchatChevronDoubleUpIcon label="Tier Up" />
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
                </Stack>
            )}
        </>
    )
}
