import { useState } from 'react'
import api from '../api/axios'

function AdminAddMenu() {


    const [shopId, setShopId] = useState('')
    const [menuName, setMenuName] = useState('')
    const [price, setPrice] = useState('')
    const [groupId, setGroupId] = useState('')

    const addMenu = async () => {

    try {

        await api.post(
            `/api/admin/menus/${shopId}`,
            {
                itemName: menuName,
                price: price,
                groupId: groupId
            }
        )

        alert('Menu added')

    } catch (err) {
        console.error(err)

        // ✅ Extract backend message
        const errorMessage = err.response?.data?.message

        if (errorMessage?.includes("already exists")) {
            alert("❌ Menu item already exists in this group")
        } else {
            alert("❌ Failed to add menu")
        }
    }
}

    return (
    <div>

        <h2>Add Menu Item</h2>

        {/* Shop ID */}
        <div>
            <label>Shop ID:</label><br />
            <input
                type="number"
                placeholder="Enter Shop ID"
                value={shopId}
                onChange={(e)=>setShopId(e.target.value)}
            />
        </div>

        <br />

        {/* Menu Name */}
        <div>
            <label>Menu Name:</label><br />
            <input
                type="text"
                placeholder="Enter item name (e.g. Paneer Butter Masala)"
                value={menuName}
                onChange={(e)=>setMenuName(e.target.value)}
            />
        </div>

        <br />

        {/* Price */}
        <div>
            <label>Price (₹):</label><br />
            <input
                type="number"
                placeholder="Enter price"
                value={price}
                onChange={(e)=>setPrice(e.target.value)}
            />
        </div>

        <br />

        {/* Group ID */}
        <div>
            <label>Group ID:</label><br />
            <input
                type="number"
                placeholder="Enter group ID"
                value={groupId}
                onChange={(e)=>setGroupId(e.target.value)}
            />
        </div>

        <br />

        {/* Button */}
        <button onClick={addMenu}>
            Add Menu Item
        </button>

    </div>
)
}

export default AdminAddMenu