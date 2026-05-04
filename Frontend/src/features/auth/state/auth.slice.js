import { createSlice } from "@reduxjs/toolkit";


export const authSlice = createSlice({
     name:"auth",
     initialState:{
        user:null,
        token: localStorage.getItem("accessToken") || null,
        loading:true,
        error:null
     },
     reducers:{
        setUser:(state,action)=>{
            state.user = action.payload
            state.token = action.payload?.accessToken || state.token
        },
        setAuth:(state,action)=>{
            state.user = action.payload.user
            state.token = action.payload.accessToken
        },
        clearAuth:(state)=>{
            state.user = null
            state.token = null
            state.error = null
        },
        setLoading:(state,action)=>{
            state.loading = action.payload
        },
        setError:(state,action)=>{
            state.error = action.payload
        },
    }

})

export const {setUser,setAuth,clearAuth,setError,setLoading} = authSlice.actions
export default authSlice.reducer
