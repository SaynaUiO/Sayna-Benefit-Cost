import Spinner from '@atlaskit/spinner'
import { CSSProperties, ReactNode } from 'react'

type LoadingProps = {
    isLoading?: boolean
    children?: ReactNode
}

export const Loading = (props: LoadingProps) => {
    const { isLoading, children } = props

    const spinnerContainerStyle: CSSProperties = {
        position: 'relative',
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    }

    return (
        <>
            {isLoading ? (
                <div style={spinnerContainerStyle}>
                    <Spinner />
                </div>
            ) : (
                children
            )}
        </>
    )
}

Loading.defaultProps = {
    isLoading: true,
}
