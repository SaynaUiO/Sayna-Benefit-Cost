import { ReactNode } from 'react'
import { Box, xcss } from '@atlaskit/primitives'
import { useScroll } from '../ScrollContext'

type PointsFieldContainerProps = {
    index: number
    children: ReactNode
}

export const PointsFieldContainer = ({
    index,
    children,
}: PointsFieldContainerProps) => {
    const { PointsFieldContainerRefs: pointsFieldContainerRefs, onScroll } =
        useScroll()

    return (
        <Box
            id="content-scroll"
            ref={pointsFieldContainerRefs[index]}
            onScroll={onScroll}
            xcss={xcss({
                backgroundColor: 'elevation.surface',
                overflowX: 'auto',
            })}
        >
            {children}
        </Box>
    )
}
