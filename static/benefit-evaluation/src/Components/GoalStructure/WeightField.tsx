import Button from '@atlaskit/button'
import Lozenge from '@atlaskit/lozenge'
import { Flex, Box, xcss } from '@atlaskit/primitives'
import TextField from '@atlaskit/textfield'
import Tooltip from '@atlaskit/tooltip'
import EditorAddIcon from '@atlaskit/icon/glyph/editor/add'
import EditorDividerIcon from '@atlaskit/icon/glyph/editor/divider'
import { useState, useRef, useEffect } from 'react'
import { Goal, balancedPointsEnum } from '../../Models'
import { SetWeightPopup } from './SetWeightPopup'

type WeightFieldProps = {
    goal: Goal
    submitting: boolean
    method: balancedPointsEnum
    postfix: string
    onChange: (points: number, method: balancedPointsEnum) => void
    maxMonetaryValue: number
}

export const WeightField = ({
    goal,
    submitting,
    method,
    postfix,
    onChange,
    maxMonetaryValue,
}: WeightFieldProps) => {
    const [monetaryValue, setMonetaryValue] = useState<number>(
        goal.balancedPoints?.type === balancedPointsEnum.MONETARY
            ? goal.balancedPoints.value
            : 0
    )
    const [weight, setWeight] = useState<number>(
        goal.balancedPoints?.type === balancedPointsEnum.WEIGHT
            ? goal.balancedPoints.value
            : 0
    )
    const [onHover, setHover] = useState<boolean>(false)

    const inputRef = useRef<HTMLInputElement | null>(null)

    const handleSelect = (event: React.MouseEvent<HTMLInputElement>) => {
        if (inputRef.current) {
            inputRef.current.select()
        }
    }

    useEffect(() => {
        onChange(weight, balancedPointsEnum.WEIGHT)
        onChange(monetaryValue, balancedPointsEnum.MONETARY)
    }, [])

    useEffect(() => {
        onChange(weight, balancedPointsEnum.WEIGHT)
    }, [weight])

    useEffect(() => {
        onChange(monetaryValue, balancedPointsEnum.MONETARY)
    }, [monetaryValue])

    const handleType = (event: React.FormEvent<HTMLInputElement>) => {
        if (inputRef.current) {
            let value = inputRef.current.value
            if (!value) {
                inputRef.current.value = '0'
            } else if (value.length > 1 && value[0] === '0') {
                inputRef.current.value = value.slice(1)
            }
            if (method === balancedPointsEnum.MONETARY) {
                if (isNaN(+value)) {
                    inputRef.current.value = monetaryValue.toString()
                } else if (value.length > maxMonetaryValue) {
                    inputRef.current.value = value.slice(0, maxMonetaryValue)
                }
                setMonetaryValue(+inputRef.current.value)
            } else {
                if (+value > 100) {
                    inputRef.current.value = '100'
                } else if (isNaN(+value)) {
                    inputRef.current.value = weight.toString()
                }
                setWeight(+inputRef.current.value)
            }
        }
    }

    const somethingElseCellStyle = xcss({
        width: '150px',
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
    })

    const calcTopCellStyle = xcss({
        height: '65px',
        backgroundColor: 'elevation.surface.sunken',
        borderRight: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'color.border',
        padding: 'space.075',
        paddingLeft: 'space.200',
        paddingRight: 'space.200',
    })

    return (
        <Flex
            direction="column"
            xcss={xcss({
                width: '150px',
                minWidth: '150px',
            })}
        >
            <Flex direction="column" xcss={calcTopCellStyle}>
                <SetWeightPopup goal={goal} method={method} />
                <Tooltip
                    content={
                        method === balancedPointsEnum.WEIGHT
                            ? 'Weight'
                            : 'Monetary Value'
                    }
                >
                    <Lozenge appearance="new">
                        {method === balancedPointsEnum.WEIGHT
                            ? `${weight} %`
                            : `${monetaryValue.toLocaleString('en-US')} ${postfix}`}
                    </Lozenge>
                </Tooltip>
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
                        isDisabled={
                            submitting ||
                            (method === balancedPointsEnum.WEIGHT &&
                                weight === 0) ||
                            (method === balancedPointsEnum.MONETARY &&
                                monetaryValue === 0)
                        }
                        onClick={() => {
                            method === balancedPointsEnum.WEIGHT
                                ? setWeight((currentWeight) =>
                                      currentWeight !== 0
                                          ? currentWeight - 1
                                          : currentWeight
                                  )
                                : setMonetaryValue((currentPoint) =>
                                      currentPoint !== 0
                                          ? currentPoint - 1
                                          : currentPoint
                                  )
                        }}
                    />
                    <TextField
                        name={`${goal.id}`}
                        onClick={handleSelect}
                        appearance="none"
                        autoComplete="off"
                        isDisabled={submitting}
                        ref={inputRef}
                        value={
                            method === balancedPointsEnum.WEIGHT
                                ? weight
                                : monetaryValue
                        }
                        style={{
                            textAlign: 'center',
                        }}
                        aria-label="customized text field"
                        onChange={handleType}
                    />
                    <Button
                        style={{ opacity: onHover ? 100 : 0 }}
                        appearance="subtle-link"
                        iconBefore={<EditorAddIcon label="subract" />}
                        size={50}
                        tabIndex={-1}
                        isDisabled={
                            submitting ||
                            (method === balancedPointsEnum.WEIGHT &&
                                weight === 100) ||
                            (method === balancedPointsEnum.MONETARY &&
                                monetaryValue ===
                                    Math.pow(10, maxMonetaryValue) - 1)
                        }
                        onClick={() => {
                            method === balancedPointsEnum.WEIGHT
                                ? weight < 100 &&
                                  setWeight(
                                      (currentWeight) => currentWeight + 1
                                  )
                                : Math.pow(10, maxMonetaryValue) - 1 &&
                                  setMonetaryValue(
                                      (currentPoint) => currentPoint + 1
                                  )
                        }}
                    />
                </Box>
            </Box>
        </Flex>
    )
}
