import { createContext, useContext, useEffect, useState } from 'react'
import { getProject } from '../Api/ProjectApi'
import { Content, Main, PageLayout } from '@atlaskit/page-layout'
import { Outlet, useNavigate, useParams } from 'react-router-dom'
import { FlagsProvider } from '@atlaskit/flag'
import { APIContextProvider } from './ApiContext'
import { view } from '@forge/bridge'
import { Loading } from '../Components/Common/Loading'
import { getPortfolio } from '../Api/PortfolioApi'
import { Nav } from '../Components/Menu/Nav'
import { SetupBarrierProvider } from './SetupBarrier'
import { HeaderNavigation } from '../Components/Menu/HeaderNavigation'
import { AlertProvider } from './AlertContext'

export enum ScopeTypeEnum {
    PROJECT,
    PORTFOLIO,
}

export type ScopeType = {
    type: ScopeTypeEnum
    name: string
    id: string
}

export type AppContextType = [ScopeType, () => void]

const AppContext = createContext<AppContextType>(undefined!)

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = () => {
    const [scope, setScope] = useState<ScopeType>()

    const navigate = useNavigate()
    const { scopeType, scopeId } = useParams()

    const getProjectId = () => {
        return view.getContext().then((context) => {
            return context.extension.project.id
        })
    }

    const setScopeToProject = () => {
        getProjectId().then((projectId) => {
            navigate(`../project/${projectId}/`, { replace: true })
        })
    }

    useEffect(() => {
        setScope(undefined)
        if (scopeType && scopeId) {
            if (scopeType === 'portfolio') {
                getPortfolio(scopeId).then((portfolio) => {
                    if (portfolio) {
                        setScope({
                            type: ScopeTypeEnum.PORTFOLIO,
                            id: portfolio.id,
                            name: portfolio.name,
                        })
                    } else {
                        setScope(undefined)
                        setScopeToProject()
                    }
                })
            } else if (scopeType === 'project') {
                getProject(scopeId).then((project) => {
                    if (project && project.id == scopeId) {
                        setScope({
                            type: ScopeTypeEnum.PROJECT,
                            id: project.id,
                            name: project.name,
                        })
                    } else {
                        setScope(undefined)
                        setScopeToProject()
                    }
                })
            } else {
                setScope(undefined)
                setScopeToProject()
            }
        } else {
            setScope(undefined)
            setScopeToProject()
        }
    }, [scopeType, scopeId])

    return (
        <APIContextProvider>
            <FlagsProvider>
                <AlertProvider>
                    <PageLayout>
                        <Content>
                            <Nav />
                            <Main>
                                {scope ? (
                                    <AppContext.Provider
                                        value={[scope, setScopeToProject]}
                                    >
                                        <SetupBarrierProvider>
                                            <HeaderNavigation />
                                            <div
                                                style={{
                                                    position: 'relative',
                                                    marginBottom: '24px',
                                                    paddingLeft: '40px',
                                                    paddingRight: '40px',
                                                }}
                                            >
                                                <Outlet />
                                            </div>
                                        </SetupBarrierProvider>
                                    </AppContext.Provider>
                                ) : (
                                    <Loading />
                                )}
                            </Main>
                        </Content>
                    </PageLayout>
                </AlertProvider>
            </FlagsProvider>
        </APIContextProvider>
    )
}
