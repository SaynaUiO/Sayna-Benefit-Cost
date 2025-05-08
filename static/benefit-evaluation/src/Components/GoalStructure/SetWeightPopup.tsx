import { token } from '@atlaskit/tokens'
import { ReactNode, useMemo, useState } from 'react'
import Button from '@atlaskit/button'
import EditorPanelIcon from '@atlaskit/icon/glyph/editor/panel'
import Popup from '@atlaskit/popup'
import React from 'react'
import { Inline, Stack, Grid, xcss } from '@atlaskit/primitives'
import Heading from '@atlaskit/heading'
import { Goal, GoalTypeEnum, balancedPointsEnum } from '../../Models'
import Lozenge from '@atlaskit/lozenge'

type SetWeightPopupProps = {
    goal: Goal
    method: balancedPointsEnum
}

export const SetWeightPopup = ({ goal, method }: SetWeightPopupProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const contentStyles: React.CSSProperties = {
        padding: token('space.200', '16px'),
        maxWidth: '200px',
    }

    return (
        <Inline alignInline="center" alignBlock="center" spread="space-between">
            <Heading level="h400">{goal.key}</Heading>
            <Popup
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                placement="bottom-start"
                zIndex={9999}
                content={() => (
                    <div style={contentStyles}>
                        <Stack>
                            <h4>{goal.key}</h4>
                            <p>{goal.description}</p>
                        </Stack>
                    </div>
                )}
                trigger={(triggerProps) => (
                    <Button
                        {...triggerProps}
                        iconBefore={<EditorPanelIcon label="Goal Info" />}
                        appearance="subtle"
                        isSelected={isOpen}
                        onClick={() => setIsOpen(!isOpen)}
                    />
                )}
            />
        </Inline>
    )
}
