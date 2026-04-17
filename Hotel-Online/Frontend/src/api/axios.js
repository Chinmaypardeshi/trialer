import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8080', //Springboot backend
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
})

//Request interceptor
//Add authorization header automatically 
api.interceptors.request.use(
    (config) => {
        const auth = localStorage.getItem('auth')
        console.log('🔐 Request to:', config.url, 'Auth present:', !!auth);

        if(auth) {
            config.headers.Authorization = auth
            console.log('🔐 Full auth header:', config.headers.Authorization);
            console.log('🔐 Auth header length:', config.headers.Authorization.length);
            console.log('🔐 All headers:', config.headers);
        }

        return config
    },
    (error) => Promise.reject(error)
)

// RESPONSE INTERCEPTOR WHICH RUNS ON EVERY RESPONSE ERROR
api.interceptors.response.use(
    (response) => {
        console.log('✅ Axios Success:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.log('❌ Axios Error:', error.response?.status, error.config?.url);
        if (error.response && error.response.status === 401) {
            console.warn('🚨 401 Unauthorized! -> Logging out...')
            console.log('Current auth in localStorage:', localStorage.getItem('auth'));

            //Clear auth data 
            localStorage.removeItem('auth')
            console.log('Auth cleared, redirecting...');

            // Redirect to login page
            // window.location.replace('/login')
            console.log('🚫 Redirect disabled for debugging');
        }
        
        return Promise.reject(error)
    }   
)



export default api