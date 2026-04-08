import { useState } from 'react'
import api from '../api/axios'

function AdminMonthlyRevenue() {
    const [year, setYear] = useState('')
    const [month, setMonth] = useState('')
    const [revenue, setRevenue] = useState(null)

    const fetchRevenue = async () => {
        if (!year || !month) {
            alert('Please select both year and month')
            return
        }

        try {
            const res = await api.get(
                `/api/admin/orders/revenue/monthly?year=${year}&month=${month}`
            )

            setRevenue(res.data)
        } catch (err) {
            console.error(err)
            alert('Failed to fetch Monthly revenue')
        }
    }

    return (
        <div>
            <h2>Monthly Revenue Report</h2>

            <input
                type="number"
                placeholder="Year (e.g., 2024)"
                value={year}
                onChange={(e) => setYear(e.target.value)}
            />

            <input
                type="number"
                placeholder="Month (1-12)"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                style={{ marginLeft: '10px' }}
            />

            <button onClick={fetchRevenue} style={{ marginLeft: '10px' }}>
                Get Monthly Report
            </button>

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

export default AdminMonthlyRevenue