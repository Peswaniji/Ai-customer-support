import axios from 'axios'

const authApiInstance = axios.create({
    baseURL:'',
    withCredentials:true
})

export const register = async({businessName,email,password,industry})=>{
   const response = await authApiInstance.post('/api/auth/register-business',{
    businessName,email,password,industry})
   console.log(response);
   
   return response.data
}
export const login = async({email,password})=>{
    const response = await authApiInstance.post('/api/auth/login',{email,password})
    return response.data
}

export const getMe = async()=>{
    const response = await authApiInstance.post('/api/business/me')
    return response.data
}
