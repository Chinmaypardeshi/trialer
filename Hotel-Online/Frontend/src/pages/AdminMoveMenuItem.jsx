import { useState } from 'react'
import api from '../api/axios'

function AdminMoveMenuItem() {


    const [menuId, setMenuId] = useState('')
    const [targetGroupId, setTargetGroupId] = useState('')

    const moveItem = async () => {

        try {

            await api.put(
                `/api/admin/menu-groups/${menuId}/move`,
                {
                    targetGroupId
                }
            )

            alert('Item moved successfully')

        } catch (err) {
            console.error(err)
            alert('Failed to move item')
        }
    }

    return (
        <div>

            <h2>Move Menu Item</h2>

            <input
                type="number"
                placeholder="Menu ID"
                value={menuId}
                onChange={(e)=>setMenuId(e.target.value)}
            />

            <br /><br />

            <input
                type="number"
                placeholder="Target Group ID"
                value={targetGroupId}
                onChange={(e)=>setTargetGroupId(e.target.value)}
            />

            <br /><br />

            <button onClick={moveItem}>
                Move Item
            </button>

        </div>
    )
}

export default AdminMoveMenuItem