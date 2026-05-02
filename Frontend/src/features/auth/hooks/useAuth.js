import {setUser,setLoading,setError} from '../state/auth.slice'
import {register,login} from '../services/auth.api'
import {useDispatch} from 'react-redux'

export const useAuth = ()=>{
    const dispatch = useDispatch()
   async function handleRegister({businessName,email,password,industry}){
     const data = await register({businessName,email,password,industry})
    //  console.log(data);
     
    dispatch(setUser(data.user))
    return data.user
   }
   async function handleLogin({email,password}){
    const data = await login({email,password}) 
    dispatch(setUser(data.user))
    return data.user
   }

//    async function handleGetMe(){
//     try{
//        dispatch(setLoading(true))
//     const data = await getMe()
//   //  console.log(data.user);
//     dispatch(setUser(data.user))
//     }catch(err){
//       console.log(err);
      
//     }finally{
//        dispatch(setLoading(false))
//     }
//    }

   return {
    handleRegister,
    handleLogin
   }
}