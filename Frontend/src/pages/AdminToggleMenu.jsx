import { useState } from 'react'
import api from '../api/axios'

function AdminToggleMenu() {


    const [menuId, setMenuId] = useState('')
    const [isActive, setIsActive] = useState(true)

    const toggleStatus = async () => {

        try {

            await api.patch(
                `/api/admin/menus/${menuId}/status?isActive=${isActive}`
            )

            alert('Status updated')

        } catch (err) {
            console.error(err)
            alert('Failed to update status')
        }
    }

    return (

        <div>

            <h2>Toggle Menu Status</h2>

            <input
                type="number"
                placeholder="Menu ID"
                value={menuId}
                onChange={(e)=>setMenuId(e.target.value)}
            />

            <br/><br/>

            <select
                value={isActive}
                onChange={(e)=>setIsActive(e.target.value)}
            >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
            </select>

            <br/><br/>

            <button onClick={toggleStatus}>
                Update Status
            </button>

        </div>

    )
}

export default AdminToggleMenu