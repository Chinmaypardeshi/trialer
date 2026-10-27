import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/axios'

function AdminOrderDetails() {

    const { orderId } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [newStatus, setNewStatus] = useState('')
 
        // Fetch Order Details
        const fetchOrderDetails = async () => {
            try {
                const res = await api.get(`/api/admin/orders/${orderId}`)
                setOrder(res.data)
            } catch (err) {
                console.error('Failed to fetch order details', err)
            } finally {
                setLoading(false)
            }
        }

    useEffect(() => {
        fetchOrderDetails()
    }, [orderId])


    //Update Status 
    const handleStatusUpdate = async () => {
        try{
            await api.patch(`/api/admin/orders/${orderId}/status`, {
                status: newStatus
            })

            alert('Order status updated successfully')
            fetchOrderDetails() //refresh after update
        } catch (err) {
            console.error('Failed to update order status', err)
            alert('Failed to update order status')
        }
    }

    if (loading) return <p>Loading order details...</p>
    if (!order) return <p>Order not found</p>

    return (
        <div>
            <h2>Order Details</h2>

            <p><b>Order ID:</b> {order.orderId}</p>
            <p>
                <b>Order Time:</b>{' '}
                {new Date(order.orderTime).toLocaleString()}
            </p>
            <p><b>Shop Name:</b> {order.shopName}</p>
            <p><b>Payment Mode:</b> {order.paymentMode}</p>
            <p><b>Total Amount:</b> ₹{order.totalAmount}</p>

            <hr />

            <h3>Status Management</h3>

            <p><b>Current Status:</b> {order.status}</p>

            <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
            >
                <option value="ACTIVE">ACTIVE</option>
                <option value="PAID">PAID</option>
                <option value="CANCELLED">CANCELLED</option>
            </select>

            <button
                onClick={handleStatusUpdate}
                style={{ marginLeft: '10px' }}
            >
                Update Status
            </button>

            <hr />

            <h3>Order Items</h3>

            {order.items?.length === 0 && <p>No items in this order</p>}

            <table border="1" cellPadding="8">
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items?.map((item, index) => (
                        <tr key={index}>
                            <td>{item.itemName}</td>
                            <td>{item.quantity}</td>
                            <td>₹{item.price}</td>
                            <td>₹{item.price * item.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    )
}

export default AdminOrderDetails