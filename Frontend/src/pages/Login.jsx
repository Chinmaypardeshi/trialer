import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function Login() {
    const navigate = useNavigate()

    const [username, setUsername ] = useState('')
    const [password, setPassword ] = useState('')
    const [error, setError] = useState('')

    // const handleLogin = async() => {
    //     console.log('Login button clicked');
    //     try{
    //         // Create basic auth token
    //         const basicAuth = 'Basic ' + btoa(username + ':' + password)
    //         console.log('Basic Auth created:', basicAuth.substring(0, 20) + '...');

    //         //Call backend using axios
    //         console.log('Calling /api/auth/login...');
    //         const response = await api.get('/api/auth/login')

    //         console.log('Response received:', response.status);
    //         console.log('Response data:', response.data);

    //          // Check if login was successful
    //         if (response.status === 200) {
    //             console.log('✅ Login successful!');
    //             // Save auth token only on success
    //             localStorage.setItem('auth', basicAuth)
    //             navigate('/admin/dashboard')
    //         } else {
    //             console.log('❌ Login failed - status:', response.status);
    //             setError('Invalid credentials')
    //         }

    //         // //Save auth token once
    //         // localStorage.setItem('auth', basicAuth)

    //         // navigate('/admin/dashboard')
        
    //     } catch (err) {
    //         console.log('❌ CATCH ERROR:', err);
    //         console.log('Error response:', err.response);
    //         console.log('Error status:', err.response?.status);
    //         console.log('Error data:', err.response?.data);
    //         setError('Invalid credentials')
    //         localStorage.removeItem('auth')
    //     }
    // }

    const handleLogin = async() => {
    console.log('=== LOGIN START ===');
    try{
        // Create basic auth token
        const basicAuth = 'Basic ' + btoa(username + ':' + password)
        console.log('Basic Auth created:', basicAuth);
        console.log('Basic Auth length:', basicAuth.length);

        // Save auth token
        localStorage.setItem('auth', basicAuth)
        console.log('Auth saved to localStorage');

        // Test dashboard immediately
        console.log('Testing dashboard with new auth...');
        const dashboardResponse = await api.get('/api/admin/dashboard?fromDate=2026-03-01&toDate=2026-03-30')
        console.log('Dashboard test success:', dashboardResponse.status);

        // Then call login endpoint
        const response = await api.get('/api/auth/login')
        console.log('Login response:', response.status);

        navigate('/admin/dashboard')
        
    } catch (err) {
        console.log('❌ ERROR:', err.response?.status, err.response?.data);
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
            id="username"           
            name="username"
            value={username}
            onChange={e => setUsername(e.target.value)}  
        />
        <br />

        <input 
            type="password"
            placeholder="Password"
            id="password"
            name="password"
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