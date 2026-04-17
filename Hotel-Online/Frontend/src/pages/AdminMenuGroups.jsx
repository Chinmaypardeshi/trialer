import { useState } from 'react'
import api from '../api/axios'

function AdminMenuGroups() {

    const [shopId, setShopId] = useState('')
    const [groups, setGroups] = useState([])

    const fetchGroups = async () => {

        if (!shopId) {
            alert('Enter shop id')
            return
        }

        try {
            const res = await api.get(
                `/api/admin/menu-groups/shop/${shopId}`
            )

            setGroups(res.data)

        } catch (err) {
            console.error(err)
            alert('Failed to load groups')
        }
    }

    return (
        <div>
            <h2>Menu Groups</h2>

            <input
                type="number"
                placeholder="Shop ID"
                value={shopId}
                onChange={(e)=>setShopId(e.target.value)}
            />

            <button onClick={fetchGroups} style={{marginLeft:'10px'}}>
                Load Groups
            </button>

            <ul>
                {groups.map(g => (
                    <li key={g.groupId}>
                        {g.groupName}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default AdminMenuGroups