import TextField from '@atlaskit/textfield'
import { useEffect, useRef, useState } from 'react'
import Button from '@atlaskit/button'
import EditorAddIcon from '@atlaskit/icon/glyph/editor/add'
import EditorDividerIcon from '@atlaskit/icon/glyph/editor/divider'
import { Box, xcss } from '@atlaskit/primitives'
import { useEstimation } from '../../Pages/Estimation/EstimationContext'
import { useEstimationTarget } from '../../Pages/Estimation/EstimationTargetContext'
import { Goal } from '../../Models/GoalModel'

type EstimationFieldProps = {
    goal: Goal
    upperGoal: Goal
    simplified?: boolean
}

export const EstimationField = ({ goal, upperGoal, simplified }: EstimationFieldProps) => {
    const { pointsToDistribute, isSubmitting: submitting } = useEstimation()
    const { updateValues } = useEstimationTarget()

    const [points, setPoints] = useState<number>(
        goal.distributedPoints![upperGoal.id] || 0
    )
    const [onHover, setHover] = useState<boolean>(false)

    const { goals } = useEstimationTarget()

    const inputRef = useRef<HTMLInputElement | null>(null)

    const handleSelect = (event: React.MouseEvent<HTMLInputElement>) => {
        if (inputRef.current) {
            inputRef.current.select()
        }
    }

    useEffect(() => {
        if (goal.distributedPoints![upperGoal.id] !== points) {
            inputRef.current!.value =
                goal.distributedPoints![upperGoal.id].toString() || '0'
            setPoints(goal.distributedPoints![upperGoal.id] || 0)
        }
    }, [goals])

    useEffect(() => {
        updateValues(points, goal, upperGoal.id)
    }, [points])

    const handleType = (event: React.FormEvent<HTMLInputElement>) => {
        if (inputRef.current) {
            let value = inputRef.current.value
            if (!value) {
                inputRef.current.value = '0'
            } else if (+value > pointsToDistribute) {
                inputRef.current.value = pointsToDistribute.toString()
            } else if (isNaN(+value)) {
                inputRef.current.value = points.toString()
            } else if (value.length > 1 && value[0] === '0') {
                inputRef.current.value = value.slice(1)
            }
            setPoints(+inputRef.current.value)
        }
    }

    const somethingElseCellStyle = xcss({
        height: simplified ? '94px' : '57px',
        width: '150px',
        borderLeft: '1px solid',
        borderColor: 'color.border',
        paddingLeft: 'space.100',
        paddingRight: 'space.100',
        display: 'flex',
        alignItems: 'center',
        cursor: 'text',
        ':hover': {
            backgroundColor: 'color.background.input.hovered',
        },
        ':focus-within': {
            backgroundColor: 'color.background.selected',
        },
        ':first-of-type': {
            borderLeft: 'none',
        },
    })

    return (
        <Box
            xcss={somethingElseCellStyle}
            onClick={handleSelect}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            <Button
                style={{ opacity: onHover ? 100 : 0 }}
                appearance="subtle-link"
                iconBefore={<EditorDividerIcon label="subract" />}
                size={50}
                tabIndex={-1}
                isDisabled={submitting || points === 0}
                onClick={() =>
                    setPoints((currentPoint) =>
                        currentPoint !== 0 ? currentPoint - 1 : currentPoint
                    )
                }
            />
            <TextField
                name={`${goal.id}-${upperGoal.id}`}
                onClick={handleSelect}
                appearance="none"
                autoComplete="off"
                isDisabled={submitting}
                ref={inputRef}
                value={points}
                style={{
                    textAlign: 'center',
                }}
                onChange={handleType}
            />
            <Button
                style={{ opacity: onHover ? 100 : 0 }}
                appearance="subtle-link"
                iconBefore={<EditorAddIcon label="subract" />}
                size={50}
                tabIndex={-1}
                isDisabled={submitting || points === pointsToDistribute}
                onClick={() =>
                    setPoints((currentPoint) =>
                        currentPoint !== pointsToDistribute
                            ? currentPoint + 1
                            : currentPoint
                    )
                }
            />
        </Box>
    )
}
