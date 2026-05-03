import axios from 'axios'

const ticketApiInstance = axios.create({
    baseURL:'http://localhost:8001',
    withCredentials:true
})

export const activeChatsForAgent = async()=>{
    const response = await ticketApiInstance.get('/api/tickets?status=open')
    return response.data
}
export const myTicketsforAgent = async({agentId})=>{
   const response = await ticketApiInstance.get(`/api/tickets`)
   console.log(response);
   
   return response.data
}

export const resolveTicket = async({ticketId})=>{
    const response = await ticketApiInstance.post(`/api/tickets?status=resolved
`)
    return response.data
}