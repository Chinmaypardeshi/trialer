import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function Login() {
    const navigate = useNavigate()

    const [username, setUsername ] = useState('')
    const [password, setPassword ] = useState('')
    const [error, setError] = useState('')

    const handleLogin = async() => {
        console.log('Login button clicked');
        try{
            // Create basic auth token
            const basicAuth = 'Basic ' + btoa(username + ':' + password)

            //Save it once
            localStorage.setItem('auth', basicAuth)

            //Call backend using axios
            await api.get(
                '/api/admin/dashboard?fromDate=2025-01-01&toDate=2026-12-31'
            )

            navigate('/admin/dashboard')
        
        } catch (err) {
            setError('Invalid credentials')
            localStorage.removeItem('auth')
        }
    }

    return (
    <div>
            <h2>Admin Login</h2>

        <input 
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}  
        />
        <br />

        <input 
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
        />
        <br />

        <button onClick={handleLogin}>
            Login
        </button>

        {error && <p style ={{ color: 'red' }}>{error}</p>}
    </div>
    )
}

export default Login