import { useState } from 'react'
import api from '../api/axios'

function AdminWeeklyRevenue() {
    const [date, setDate] = useState('')
    const [revenue, setRevenue] = useState(null)
    const [loading, setLoading] = useState(false)

    const fetchRevenue = async () => {
        if (!date) {
            alert('Please select a date')
            return
        }

        try {
            setLoading(true)

            const res = await api.get(
                `/api/admin/orders/revenue/weekly?date=${date}`
            )

            setRevenue(res.data)
        } catch (err) {
            console.error(err)
            alert('Failed to fetch revenue')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h2>Weekly Revenue Report</h2>

            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />

            <button onClick={fetchRevenue} style={{ marginLeft: '10px'}}>
                Get Weekly Report
            </button>

            {loading && <p>Loading...</p>}

            {revenue && (
                <div>
                    <p><b>From:</b> {revenue.fromDate}</p>
                    <p><b>To:</b> {revenue.toDate}</p>
                    <p><b>Total Orders:</b> {revenue.totalOrders}</p>
                    <p><b>Total Revenue:</b> ₹{revenue.totalRevenue}</p>
                </div>
            )}
        </div>
    )
}

export default AdminWeeklyRevenue