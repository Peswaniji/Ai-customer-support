import {configureStore} from '@reduxjs/toolkit'
import authReducer from '../features/auth/state/auth.slice.js'
import ticketReducer from '../features/tickets/state/ticket.slice.js'
import chatReducer from '../features/chat/state/chat.slice.js'
import analyticsReducer from '../features/analytics/analytics.slice.js'
import dashboardReducer from '../features/dashboard/dashboard.slice.js'
import settingsReducer from '../features/settings/settings.slice.js'
import agentReducer from '../features/agent/agent.slice.js'

export const store = configureStore({
    reducer:{
        auth:authReducer,
        ticket:ticketReducer,
        chat:chatReducer,
        analytics: analyticsReducer,
        dashboard: dashboardReducer,
        settings: settingsReducer,
        agents: agentReducer,
    }
})