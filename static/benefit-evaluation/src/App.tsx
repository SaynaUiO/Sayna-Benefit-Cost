import { useEffect, useState } from 'react'
import { view } from '@forge/bridge'
import { Router } from 'react-router'
import { Loading } from './Components/Common/Loading'
import { Action as RouterAction } from '@remix-run/router/dist/history'
import { Action, Location, History } from 'history'
import { AppRoutes } from './AppRoutes'
import {
    SpotlightManager,
} from '@atlaskit/onboarding'

import './app.css'

type historyState = {
    action: Action
    location: Location
}

export const App = () => {
    const [history, setHistory] = useState<History>()
    const [historyState, setHistoryState] = useState<historyState>()

    useEffect(() => {
        view.createHistory().then((newHistory) => {
            setHistory(newHistory)
        })
    }, [])

    useEffect(() => {
        if (!historyState && history) {
            setHistoryState({
                action: history.action,
                location: history.location,
            })
        }
    }, [history, historyState])

    useEffect(() => {
        if (history) {
            history.listen((location, action) => {
                setHistoryState({
                    action,
                    location,
                })
            })
        }
    }, [history])

    return history && historyState ? (
        <Router
            navigator={history}
            navigationType={historyState.action as RouterAction}
            location={historyState.location}
        >
            <SpotlightManager>
                <AppRoutes />
            </SpotlightManager>
        </Router>
    ) : (
        <Loading />
    )
}
