import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children}) {
    const auth = localStorage.getItem('auth')

    if(!auth) {
        return <Navigate to ="/login" replace />
    }
    return children
}

export default ProtectedRoute

// This component checks if the user is authenticated by looking for an 'auth' token in localStorage. If the token is not found, it redirects the user to the login page. If the token exists, it renders the child components (the protected content).