import { useState } from 'react'
import api from '../api/axios'

function AdminDailyRevenue(){
    const [date, setDate] = useState('')
    const [revenue, setRevenue] = useState(null)
    const [loading, setLoading] = useState(false)

    const fetchRevenue = async () => {
        if (!date) {
            alert('Please select a date')
            return
        }

        try{
            setLoading(true)

            const res = await api.get(
                `/api/admin/orders/revenue/daily?date=${date}`
            )

            setRevenue(res.data)
        } catch (err) {
            console.error('Failed to fetch revenue', err)
            alert('Failed to fetch revenue')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2>Daily Revenue Report</h2>

            <div style={{ marginBottom: '20px' }}>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />

                <button 
                    onClick={fetchRevenue} 
                    style={{ marginLeft: '10px' }}
                >
                    Get Report
                </button>
            </div>

            {loading && <p>Loading revenue...</p>}

            {revenue && (
                <div>
                    <p><b>From date:</b> {revenue.fromDate}</p>
                    <p><b>To date:</b> {revenue.toDate}</p>
                    <p><b>Total Orders:</b> {revenue.totalOrders}</p>
                    <p><b>Total Revenue:</b> ₹{revenue.totalRevenue}</p>
                </div>
            )}
        </div>
    )
}

export default AdminDailyRevenue