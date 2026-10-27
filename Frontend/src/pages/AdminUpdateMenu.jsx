import { useState } from 'react'
import api from '../api/axios'

function AdminUpdateMenu() {


    const [menuId, setMenuId] = useState('')
    const [menuName, setMenuName] = useState('')
    const [price, setPrice] = useState('')

    const updateMenu = async () => {

        try {

            await api.put(
                `/api/admin/menus/${menuId}`,
                {
                    menuName,
                    price
                }
            )

            alert('Menu updated')

        } catch (err) {
            console.error(err)
            alert('Update failed')
        }
    }

    return (

        <div>

            <h2>Update Menu</h2>

            <input
                type="number"
                placeholder="Menu ID"
                value={menuId}
                onChange={(e)=>setMenuId(e.target.value)}
            />

            <br/><br/>

            <input
                type="text"
                placeholder="New name"
                value={menuName}
                onChange={(e)=>setMenuName(e.target.value)}
            />

            <br/><br/>

            <input
                type="number"
                placeholder="New price"
                value={price}
                onChange={(e)=>setPrice(e.target.value)}
            />

            <br/><br/>

            <button onClick={updateMenu}>
                Update Menu
            </button>

        </div>

    )
}

export default AdminUpdateMenu