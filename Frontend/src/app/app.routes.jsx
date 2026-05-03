import {createBrowserRouter} from 'react-router-dom'
import Register from '../features/auth/pages/Register'
import Login from '../features/auth/pages/Login'
import AgentSidebar from '../features/agent/components/AgentSidebar'
import Layout from '../features/agent/pages/Layout'
import Dashboard from '../features/agent/pages/Dashboard'
import ChatSection from '../features/agent/pages/ChatSection'
import MyTickets from '../features/agent/pages/MyTickets'

export const routes = createBrowserRouter([
    {
        path:'/',
        element:<h1>Hello</h1>
    },
    {
        path:'/register',
        element:<Register />
    },
    {
        path:'/login',
        element:<Login />
    },
    {
        path:'/agent',
        element:<Layout />,
        children:[
            {
                path:'dashboard',
                element:<Dashboard />
            },
            {
                path:'chats/:ticketId',
                element:<ChatSection />
            },{
                path:'my-tickets',
                element:<MyTickets />
            }
        ]
    }
  
        
    
])