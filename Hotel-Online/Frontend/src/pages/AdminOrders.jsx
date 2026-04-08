import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

function AdminOrders(){
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/api/admin/orders')
                setOrders(res.data)
            } catch (err) {
                console.error('Failed to fetch orders', err)
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [])

    if (loading) return <p>Loading orders...</p>

    return (
        <div>
            <h2>Orders</h2>

            {orders.length === 0 && <p>No orders found</p>}

            <ul>
                {orders.map(order => (
                    <li
                        key={order.orderId}
                        style={{ cursor: 'pointer'}}
                        onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                    >
                        Order #{order.orderId} | 
                        Status: {order.status} | 
                        Amount: {order.totalAmount} | 
                        Shop: {order.shopName} |
                        Payment: {order.paymentMode} |
                        Order Time: {new Date(order.orderTime).toLocaleString()}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default AdminOrders