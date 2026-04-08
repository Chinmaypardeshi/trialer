import { useState } from 'react'
import api from '../api/axios'

function AdminYearlyRevenue() {
    const [year, setYear] = useState('')
    const [revenue, setRevenue] = useState(null)

    const fetchRevenue = async () => {
        if (!year) {
            alert('Please select a year')
            return
        }

        try {
            const res = await api.get(
                `/api/admin/orders/revenue/yearly?year=${year}`
            )

            setRevenue(res.data)
        } catch (err) {
            console.error(err)
            alert('Failed to fetch Yearly revenue')
        }
    }

    return (
        <div>
            <h2>Yearly Revenue Report</h2>

            <input
                type="number"
                placeholder="Year (e.g., 2024)"
                value={year}
                onChange={(e) => setYear(e.target.value)}
            />

            <button onClick={fetchRevenue} style={{ marginLeft: '10px' }}>
                Get Yearly Report
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

export default AdminYearlyRevenue
