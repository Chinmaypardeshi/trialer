import { useState } from 'react'
import api from '../api/axios'

function AdminMenusByShop() {


    const [shopId, setShopId] = useState('')
    const [menus, setMenus] = useState([])

    const fetchMenus = async () => {

        if (!shopId) {
            alert('Enter shop id')
            return
        }

        try {

            const res = await api.get(
                `/api/admin/menus/${shopId}`
            )

            setMenus(res.data)

        } catch (err) {
            console.error(err)
            alert('Failed to load menus')
        }
    }

    return (
        <div>

            <h2>Menus</h2>

            <input
                type="number"
                placeholder="Shop ID"
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
            />

            <button onClick={fetchMenus} style={{marginLeft:'10px'}}>
                Load Menus
            </button>

            <ul>
                {menus.map(m => (
                    <li key={m.menuId}>
                        {m.menuId} - {m.itemName} — ₹{m.price} - {m.isActive} - {m.groupId} - {m.groupName}
                    </li>
                ))}
            </ul>

        </div>
    )
}

export default AdminMenusByShop