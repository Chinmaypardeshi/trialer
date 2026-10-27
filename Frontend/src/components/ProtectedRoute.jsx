import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }) {
    const auth = localStorage.getItem('auth')

    if (!auth) {
        return <Navigate to="/login" replace />
    }

    return children
}

export default ProtectedRoute

//Only checks authentication 