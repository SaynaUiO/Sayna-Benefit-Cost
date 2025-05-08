import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Project, Portfolio } from '../Models'
import { getProject } from '../Api/ProjectApi'
import { SetIssueType } from '../Components/SettingsComponents/SetIssueType'
import { ScopeTypeEnum, useAppContext } from './AppContext'
import { Loading } from '../Components/Common/Loading'
import { SetIssueStatuses } from '../Components/SettingsComponents/SetIssueStatuses'
import { ProgressTracker, Stages } from '@atlaskit/progress-tracker'
import PageHeader from '@atlaskit/page-header'
import { useAPI } from './ApiContext'

type SetupBarrierProps = {
    children: ReactNode
}

export type SetupBarrierContextType = {
    getCurrentLocationDetails: () => Promise<Project | Portfolio | undefined>
}

export const SetupBarrierProvider = ({ children }: SetupBarrierProps) => {
    const [isLoading, setLoading] = useState<boolean>(true)
    const [isFetching, setFetching] = useState<boolean>(false)
    const [issueType, setIssueType] = useState<string>()
    const [issueStatuses, setIssueStatuses] = useState<string[]>()

    const [scope] = useAppContext()
    const api = useAPI()

    const checkProject = async () => {
        setFetching(true)
        if (scope.type === ScopeTypeEnum.PROJECT) {
            await getProject(scope.id).then((project) => {
                if (project) {
                    setIssueType(project.issueTypeId)
                    setIssueStatuses(project.issueStatusesIds)
                    setFetching(false)
                    return project.issueTypeId
                } else {
                    console.error('Cant find project')
                    setIssueType(undefined)
                    setIssueStatuses(undefined)
                    setFetching(false)
                    return undefined
                }
            })
        }
    }

    useEffect(() => {
        setLoading(true)
        checkProject().then(() => setLoading(false))
    }, [scope])

    const authorized = useMemo(() => {
        return issueType && issueStatuses && issueStatuses.length > 0
    }, [issueType, issueStatuses])


    const items: Stages = [
        {
            id: 'disabled-1',
            label: 'Select Issue Type',
            percentageComplete: issueType ? 100 : 0,
            status: issueType ? 'disabled' : 'current',
        },
        {
            id: 'current-1',
            label: 'Select Issue Statuses',
            percentageComplete: 0,
            status: issueType ? 'current' : 'disabled',
        },
    ]

    return scope.type === ScopeTypeEnum.PROJECT ? (
        isLoading ? (
            <Loading />
        ) : authorized ? (
            <>{children}</>
        ) : (
            <div
                style={{
                    position: 'relative',
                    marginTop: '24px',
                    marginBottom: '24px',
                    paddingLeft: '40px',
                    paddingRight: '40px',
                }}
            >
                <PageHeader>Project Initialization</PageHeader>
                <ProgressTracker items={items} />
                <p>
                    To initiate the Project, select the issue type you use as
                    your epic
                </p>
                <SetIssueType onSave={() => checkProject()} />
                {issueType && (
                    <>
                        <p>Select which issue statuses you want to evalute</p>
                        <p>This can be changed later</p>
                        <SetIssueStatuses onSave={() => checkProject()} />
                    </>
                )}
                {isFetching && <Loading />}
            </div>
        )
    ) : (
        <>{children}</>
    )
}
