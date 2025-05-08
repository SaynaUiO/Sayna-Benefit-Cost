import { Box, xcss } from '@atlaskit/primitives'
import { GoalLabel } from '../GoalLabel'
import { useEstimationTarget } from '../../../Pages/Estimation/EstimationTargetContext'

type Props = {
    simplified?: boolean
}

export const GoalLabelContainer = ({ simplified }: Props) => {
    const { goals } = useEstimationTarget()

    return (
        <Box
            xcss={xcss({
                borderRight: '1px solid',
                borderColor: 'color.border',
                borderCollapse: 'collapse',
            })}
        >
            {goals.map((goal) => {
                return <GoalLabel key={`${goal.id}-label`} goal={goal} simplified={simplified} />
            })}
            {goals.length === 0 && <Box />}
        </Box>
    )
}
