import { useState } from 'react'
import api from '../api/axios'

function AdminCreateGroup() {

    const [shopId, setShopId] = useState('')
    const [groupName, setGroupName] = useState('')

    const createGroup = async () => {

        if (!shopId || !groupName) {
            alert('Fill all fields')
            return
        }

        try {

            await api.post(
                `/api/admin/menu-groups/shop/${shopId}`,
                { groupName }
            )

            alert('Group created')

        } catch (err) {
            console.error(err)
            alert('Failed to create group')
        }
    }

    return (
        <div>

            <h2>Create Group</h2>

            <input
                type="number"
                placeholder="Shop ID"
                value={shopId}
                onChange={(e)=>setShopId(e.target.value)}
            />

            <br /><br />

            <input
                type="text"
                placeholder="Group Name (e.g. Starters)"
                value={groupName}
                onChange={(e)=>setGroupName(e.target.value)}
            />

            <br /><br />

            <button onClick={createGroup}>
                Create Group
            </button>

        </div>
    )
}

export default AdminCreateGroup