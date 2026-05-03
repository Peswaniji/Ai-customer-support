import { createSlice } from "@reduxjs/toolkit";


export const ticketSlice = createSlice({
     name:"ticket",
     initialState:{
         tickets: [],
         activeTickets: [],
         resolvedTickets: [],
         currentTicket: null,
         messages: [],
         loading: false,
         error: null
     },
     reducers:{
        setTickets:(state,action)=>{
            state.tickets = action.payload
        },
        setActiveTickets:(state,action)=>{
            state.activeTickets = action.payload
        },
        setResolvedTickets:(state,action)=>{
            state.resolvedTickets = action.payload
        },
        setCurrentTicket:(state,action)=>{
            state.currentTicket = action.payload
        },
        setMessages:(state,action)=>{
            state.messages = action.payload
        },
        setLoading:(state,action)=>{
            state.loading = action.payload
        },
        setError:(state,action)=>{
            state.error = action.payload
        },
    }

})

export const {setTickets,setActiveTickets,setResolvedTickets,setCurrentTicket,setMessages,setLoading,setError} = ticketSlice.actions
export default ticketSlice.reducer