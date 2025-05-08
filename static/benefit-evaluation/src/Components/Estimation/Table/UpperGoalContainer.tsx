import { ReactNode } from 'react'
import { Grid, Box, xcss } from '@atlaskit/primitives'
import { HideScrollBar } from '../../../Functions/EstimationHelper'
import { useScroll } from '../ScrollContext'

type UpperGoalContainerProps = {
    children: ReactNode
}

export const UpperGoalContainer = ({ children }: UpperGoalContainerProps) => {
    const { UpperGoalScroll, onScroll } = useScroll()

    return (
        <Grid
            templateColumns="150px 1fr"
            templateRows="57px"
            xcss={xcss({
                position: 'sticky',
                top: '0',
                maxWidth: '100%',
                pointerEvents: 'none',
                zIndex: 'dialog',
            })}
        >
            <Box />
            <HideScrollBar
                style={{
                    overflowX: 'scroll',
                    display: 'grid',
                    gridAutoColumns: '150px',
                    gridAutoFlow: 'column',
                    pointerEvents: 'auto',
                }}
                scrollRef={UpperGoalScroll}
                onScroll={onScroll}
            >
                {children}
            </HideScrollBar>
        </Grid>
    )
}
