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

        if(auth) {
            config.headers.Authorization = auth
        }

        return config
    },
    (error) => Promise.reject(error)
)

// RESPONSE INTERCEPTOR WHICH RUNS ON EVERY RESPONSE ERROR
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('401 Unauthorized! -> Logging out...')

            //Clear auth data 
            localStorage.removeItem('auth')

            // Redirect to login page
            window.location.href = '/login'
        }
        
        return Promise.reject(error)
    }   
)



export default api