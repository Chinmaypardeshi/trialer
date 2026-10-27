// Import React hooks:
// useState  -> to store dashboard data in state
// useEffect -> to run code when the component loads
import { useEffect, useState } from 'react'

import DashboardCard from "../components/cards/DashboardCard";

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
  <div className="space-y-8">

    <div>
      <h1 className="text-3xl font-bold text-gray-800">
        Dashboard
      </h1>

      <p className="text-gray-500 mt-1">
        Welcome back! Here's what's happening today.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      <DashboardCard
        title="Paid Orders"
        value={data.paidOrders}
        color="bg-green-600"
      />

      <DashboardCard
        title="Active Orders"
        value={data.activeOrders}
        color="bg-blue-600"
      />

      <DashboardCard
        title="Cancelled Orders"
        value={data.cancelledOrders}
        color="bg-red-600"
      />

      <DashboardCard
        title="Revenue"
        value={`₹${data.totalRevenue}`}
        color="bg-orange-600"
      />

    </div>

  </div>
)

}




// Export component so it can be used in routing or other components
export default AdminDashboard