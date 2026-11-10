import { useState } from 'react'
import api from '../api/axios'

function AdminRenameGroup() {


    const [groupId, setGroupId] = useState('')
    const [groupName, setGroupName] = useState('')

    const renameGroup = async () => {

        try {

            await api.put(
                `/api/admin/menu-groups/${groupId}`,
                { groupName }
            )

            alert('Group renamed')

        } catch (err) {
            console.error(err)
            alert('Failed to rename group')
        }
    }

    return (
        <div>

            <h2>Rename Group</h2>

            <input
                type="number"
                placeholder="Group ID"
                value={groupId}
                onChange={(e)=>setGroupId(e.target.value)}
            />

            <br /><br />

            <input
                type="text"
                placeholder="New Group Name"
                value={groupName}
                onChange={(e)=>setGroupName(e.target.value)}
            />

            <br /><br />

            <button onClick={renameGroup}>
                Rename
            </button>

        </div>
    )
}

export default AdminRenameGroup