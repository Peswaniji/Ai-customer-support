import {configureStore} from '@reduxjs/toolkit'
import authReducer from '../features/auth/state/auth.slice'
import ticketReducer from '../features/tickets/state/ticket.slice'

export const store = configureStore({
    reducer:{
        auth:authReducer,
        ticket:ticketReducer
    }
})