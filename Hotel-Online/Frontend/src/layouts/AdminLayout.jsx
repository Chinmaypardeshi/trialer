//Wrap all admin pages
//Provide a Logout button
//Handle logout centrally
//Render child pages via <Outlet />

import { Outlet, useNavigate } from 'react-router-dom'

function AdminLayout() {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('auth')
        navigate('/login')
    }

    return (
        <div>
            {/* Platform-level controls*/}
            <header>
                <h3>Admin Panel</h3>
                <button onClick={handleLogout}>Logout</button>
            </header>

            <hr />
            
            {/* This renders the current admin page */}
            <main>
                <Outlet />
            </main>


        </div>
    )
}

export default AdminLayout