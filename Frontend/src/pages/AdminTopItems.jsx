import { useState } from 'react'
import api from '../api/axios'

function AdminTopItems() {


    const [groupId, setGroupId] = useState('')
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [items, setItems] = useState([])

    const fetchTopItems = async () => {

        if (!groupId || !fromDate || !toDate) {
            alert('Please select group and both dates.')
            return
        }

        try {

            const res = await api.get(
                `/api/admin/analytics/top-items/${groupId}/items?fromDate=${fromDate}&toDate=${toDate}`
            )

            setItems(res.data)

        } catch (err) {
            console.error('Error fetching top items:', err)
            alert('Failed to fetch top items. Please try again.')
        }
    }

    return (
        <div>

            <h2>Top Ordered Items in the Group</h2>

            <input
                type="number"
                placeholder="Group ID"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
            />

            <br /><br />

            <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
            />

            <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ marginLeft: '10px' }}
            />

            <button onClick={fetchTopItems} style={{ marginLeft: '10px' }}>
                Get Report
            </button>

            <ul>
                {items.map((item) => (
                    <li key={item.itemId}>
                        {item.itemName} - Orders: {item.totalOrders}
                    </li>
                ))}
            </ul>
        </div>
    
    )
}

export default AdminTopItems