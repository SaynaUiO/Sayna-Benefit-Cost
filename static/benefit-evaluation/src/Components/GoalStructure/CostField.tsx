import Button from '@atlaskit/button'
import { Flex, Box, xcss } from '@atlaskit/primitives'
import TextField from '@atlaskit/textfield'
import EditorAddIcon from '@atlaskit/icon/glyph/editor/add'
import EditorDividerIcon from '@atlaskit/icon/glyph/editor/divider'
import { useState, useRef, useEffect } from 'react'
import { balancedPointsEnum, Goal, CostTime } from '../../Models'
import { SetWeightPopup } from './SetWeightPopup'

type WeightFieldProps = {
    task: Goal
    submitting: boolean
    initialValue: CostTime
    onChange: (cost: number, time: number, goal: Goal) => void
}

export const CostField = ({
    task,
    submitting,
    initialValue,
    onChange,
}: WeightFieldProps) => {
    const [cost, setCost] = useState<number>(initialValue?.cost || 1)
    const [time, setTime] = useState<number>(initialValue?.time || 0)
    const [onHover1, setHover1] = useState<boolean>(false)
    const [onHover2, setHover2] = useState<boolean>(false)

    const inputRefCost = useRef<HTMLInputElement | null>(null)
    const inputRefTime = useRef<HTMLInputElement | null>(null)

    const handleSelectCost = () => {
        if (inputRefCost.current) {
            inputRefCost.current.select()
        }
    }

    const handleSelectTime = () => {
        if (inputRefTime.current) {
            inputRefTime.current.select()
        }
    }

    const handleTypeCost = () => {
        if (inputRefCost.current) {
            let value = inputRefCost.current.value
            if (!value || value === '') {
                inputRefCost.current.value = '0'
            } else {
                let val = parseInt(value)
                if (val < 1) val = 1
                if (val > 9999999) val = 9999999
                setCost(val)
            }
        }
    }

    const handleTypeTime = () => {
        if (inputRefTime.current) {
            let value = inputRefTime.current.value
            if (!value || value === '') {
                inputRefTime.current.value = '0'
            } else {
                let val = parseInt(value)
                if (val < 0) val = val * -1
                if (val > 1000) val = 1000
                setTime(val)
            }
        }
    }

    useEffect(() => {
        onChange(cost, time, task)
    }, [cost, time])

    const somethingElseCellStyle = xcss({
        width: '140px',
        paddingLeft: 'space.100',
        height: '94px',
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
    })

    const calcTopCellStyle = xcss({
        height: '94px',
        width: '300px',
        backgroundColor: 'elevation.surface.sunken',
        paddingBottom: 'space.075',
        paddingLeft: 'space.200',
        paddingRight: 'space.200',
        borderBottom: '1px solid',
        borderColor: 'color.border',
        ':last-child': {
            borderBottom: 'none',
        },
    })

    return (
        <Flex
            direction="row"
            xcss={xcss({
                width: '580px',
            })}
        >
            <Flex direction="column" xcss={calcTopCellStyle}>
                <p
                    style={{
                        marginTop: '0.25rem',
                        marginBottom: '0.25rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        WebkitLineClamp: 4,
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                    }}
                    title={task.description}
                >
                    {task.description}
                </p>
            </Flex>
            <Box
                xcss={xcss({
                    borderRight: '1px solid',
                    borderColor: 'color.border',
                    overflowX: 'hidden',
                })}
            >
                <Box
                    xcss={somethingElseCellStyle}
                    onClick={handleSelectCost}
                    onMouseEnter={() => setHover1(true)}
                    onMouseLeave={() => setHover1(false)}
                >
                    <Button
                        style={{ opacity: onHover1 ? 100 : 0 }}
                        appearance="subtle-link"
                        iconBefore={<EditorDividerIcon label="subract" />}
                        size={50}
                        tabIndex={-1}
                        isDisabled={submitting || cost <= 1}
                        onClick={() => {
                            if (cost > 1)
                                setCost((currentValue) => currentValue - 1)
                        }}
                    />
                    <TextField
                        name={`${task.id}`}
                        onClick={handleSelectCost}
                        appearance="none"
                        autoComplete="off"
                        isDisabled={submitting}
                        ref={inputRefCost}
                        value={cost}
                        style={{
                            textAlign: 'center',
                        }}
                        onChange={handleTypeCost}
                    />
                    <Button
                        style={{ opacity: onHover1 ? 100 : 0 }}
                        appearance="subtle-link"
                        iconBefore={<EditorAddIcon label="subract" />}
                        size={50}
                        tabIndex={-1}
                        isDisabled={submitting || cost >= 9999999}
                        onClick={() => {
                            if (cost < 1000)
                                setCost((currentValue) => currentValue + 1)
                        }}
                    />
                </Box>
            </Box>
            <Box
                xcss={xcss({
                    borderRight: '1px solid',
                    borderColor: 'color.border',
                    overflowX: 'hidden',
                })}
            >
                <Box
                    xcss={somethingElseCellStyle}
                    onClick={handleSelectTime}
                    onMouseEnter={() => setHover2(true)}
                    onMouseLeave={() => setHover2(false)}
                >
                    <Button
                        style={{ opacity: onHover2 ? 100 : 0 }}
                        appearance="subtle-link"
                        iconBefore={<EditorDividerIcon label="subract" />}
                        size={50}
                        tabIndex={-1}
                        isDisabled={submitting || time <= 0}
                        onClick={() => {
                            setTime((currentValue) => currentValue - 1)
                        }}
                    />
                    <TextField
                        name={`${task.id}`}
                        onClick={handleSelectTime}
                        appearance="none"
                        autoComplete="off"
                        isDisabled={submitting}
                        ref={inputRefTime}
                        value={time}
                        style={{
                            textAlign: 'center',
                        }}
                        onChange={handleTypeTime}
                    />
                    <Button
                        style={{ opacity: onHover2 ? 100 : 0 }}
                        appearance="subtle-link"
                        iconBefore={<EditorAddIcon label="subract" />}
                        size={50}
                        tabIndex={-1}
                        isDisabled={submitting}
                        onClick={() => {
                            setTime((currentValue) => currentValue + 1)
                        }}
                    />
                </Box>
            </Box>
        </Flex>
    )
}
