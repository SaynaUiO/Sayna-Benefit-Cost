import { ReactNode } from 'react'
import { Grid, xcss } from '@atlaskit/primitives'
import { EstimationMode } from '../../../Models/EstimationModel'

type CGCLabelContainerProps = {
    mode: EstimationMode
    children: ReactNode
}

export const CGCLabelContainer = ({
    mode,
    children,
}: CGCLabelContainerProps) => {
    const CGCStyle = xcss({
        gridTemplateRows:
            mode === EstimationMode.PORTFOLIO_ITEMS ? '86px' : '56px',
        gridTemplateColumns: '150px 1fr',
        position: 'sticky',
        zIndex: 'navigation',
        backgroundColor: 'elevation.surface.sunken',
        top: '0',
        marginTop: '-1px',
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'color.border',
        alignSelf: 'start',
    })

    return <Grid xcss={CGCStyle}>{children}</Grid>
}
