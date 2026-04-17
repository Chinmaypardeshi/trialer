// Import React hooks:
// useState  -> to store dashboard data in state
// useEffect -> to run code when the component loads
import { useEffect, useState } from 'react'

// Import a pre-configured Axios instance
// (usually contains baseURL, auth headers, interceptors, etc.)
import api from '../api/axios'

function AdminDashboard() {

    // State to store dashboard data coming from backend
    // Initially null because data is not loaded yet
    const [data, setData] = useState(null)

    // useEffect runs when the component is mounted (page loads)
    // Empty dependency array [] means it runs ONLY ONCE
    useEffect(() => {

         // Async function to fetch dashboard data from backend
        const fetchDashboard = async () => {

             // Use current date range
        const today = new Date()
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        
        const fromDate = firstDay.toISOString().split('T')[0]
        const toDate = lastDay.toISOString().split('T')[0]
 
        const res = await api.get(
            `/api/admin/dashboard?fromDate=${fromDate}&toDate=${toDate}`
        )
        setData(res.data)






            // // Call backend API using axios
            // // This hits Spring Boot endpoint and returns JSON data
            // const res = await api.get(
            //     '/api/admin/dashboard?fromDate=2025-01-01&toDate=2026-12-31'
            // )

            // // Save backend response data into React state
            // // res.data contains the JSON returned by backend
            // setData(res.data)
        
        
        }

        // Call the function to fetch data
        fetchDashboard()
    }, [])

    

    // While data is still null (API call not finished),
    // show a loading message instead of dashboard
    if (!data) return <p>Loading...</p>

    // Once data is available, render the dashboard UI
    return (
        <div>
            <h2>Admin Dashboard</h2>

            
            <p>Paid Orders : {data.paidOrders}</p>
            <p>Active Orders: {data.activeOrders}</p>
             <p>Cancelled Orders: {data.cancelledOrders}</p>
            <p>Total Revenue: {data.totalRevenue}</p>
        </div>
    )

}




// Export component so it can be used in routing or other components
export default AdminDashboard