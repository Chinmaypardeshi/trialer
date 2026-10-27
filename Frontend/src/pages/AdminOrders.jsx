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
  <div className="space-y-6">

    <div>
      <h1 className="text-3xl font-bold">
        Orders
      </h1>

      <p className="text-gray-500">
        View all restaurant orders.
      </p>
    </div>

    <div className="bg-white rounded-xl shadow overflow-hidden">

      <table className="w-full">

        <thead className="bg-gray-100">

          <tr>

            <th className="text-left p-4">Order ID</th>
            <th className="text-left p-4">Shop</th>
            <th className="text-left p-4">Amount</th>
            <th className="text-left p-4">Status</th>
            <th className="text-left p-4">Payment</th>
            <th className="text-left p-4">Date</th>
            <th className="text-left p-4">Action</th>

          </tr>

        </thead>

        <tbody>

          {orders.map(order => (

            <tr
              key={order.orderId}
              className="border-b hover:bg-gray-50"
            >

              <td className="p-4">
                #{order.orderId}
              </td>

              <td className="p-4">
                {order.shopName}
              </td>

              <td className="p-4">
                ₹{order.totalAmount}
              </td>

              <td className="p-4">

                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">

                  {order.status}

                </span>

              </td>

              <td className="p-4">
                {order.paymentMode}
              </td>

              <td className="p-4">
                {new Date(order.orderTime).toLocaleDateString()}
              </td>

              <td className="p-4">

                <button
                  onClick={() => navigate(`/admin/orders/${order.orderId}`)}
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                >
                  View
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  </div>
)
}

export default AdminOrders