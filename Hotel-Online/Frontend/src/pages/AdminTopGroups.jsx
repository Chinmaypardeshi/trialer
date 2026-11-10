import { useState } from 'react'
import api from '../api/axios'

function AdminTopGroups() {


    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [groups, setGroups] = useState([])

    const fetchTopGroups = async () => {

        if (!fromDate || !toDate) {
            alert('Please select both dates.')
            return
        }

        try {

            const res = await api.get(
                `/api/admin/analytics/top-groups?fromDate=${fromDate}&toDate=${toDate}`
            )

            setGroups(res.data)

        } catch (err) {
            console.error('Error fetching top groups:', err)
            alert('Failed to fetch top groups. Please try again.')
        }
    }

    return (
        <div>
            <h2>Top Ordered Groups</h2>

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

            <button onClick={fetchTopGroups} style={{ marginLeft: '10px' }}>
                Fetch Top Groups
            </button>

            <ul>
                {groups.map((g) => ( 
                    <li key={g.groupId}>
                        {g.groupName} - Orders: {g.totalOrders}
                    </li>
                ))}
            </ul>
        
        </div>
    )
}

export default AdminTopGroups