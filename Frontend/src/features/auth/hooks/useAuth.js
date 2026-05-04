import {setAuth,setUser,setLoading,setError} from '../state/auth.slice'
import {register,login} from '../services/auth.api'
import {useDispatch} from 'react-redux'

export const useAuth = ()=>{
    const dispatch = useDispatch()
   async function handleRegister({businessName,email,password,industry}){
     const data = await register({businessName,email,password,industry})
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken)
      dispatch(setAuth({ user: data.user, accessToken: data.accessToken }))
    } else {
      dispatch(setUser(data.user))
    }
    return data
   }
   async function handleLogin({email, password}) {
   try {
      const data = await login({email, password});
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken)
        dispatch(setAuth({ user: data.user, accessToken: data.accessToken }));
      } else {
        dispatch(setUser(data.user));
      }
      return data;
   } catch (err) {
      console.error("Login failed:", err.response?.data?.message || err.message);
      throw err;  // ← error upar bhejo taaki Login.jsx handle kar sake
   }
}

   return {
    handleRegister,
    handleLogin
   }
}
