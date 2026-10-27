import { useState } from 'react'
import api from '../api/axios'

function AdminDailyRevenue() {
    const [date, setDate] = useState('')
    const [revenue, setRevenue] = useState(null)
    const [loading, setLoading] = useState(false)

    const fetchRevenue = async () => {

        if (!date) {
            alert('Please select a date')
            return
        }

        try {
            setLoading(true)

            const res = await api.get(
                `/api/admin/orders/revenue/daily?date=${date}`
            )

            setRevenue(res.data)

        } catch (err) {
            console.error('Failed to fetch revenue', err)
            alert('Failed to fetch revenue')

        } finally {
            setLoading(false)
        }
    }

    return (

        <div className="space-y-8">

            {/* Page Heading */}
            <div>

                <h1 className="text-3xl font-bold text-gray-800">
                    Daily Revenue
                </h1>

                <p className="text-gray-500 mt-1">
                    View restaurant revenue for a specific day.
                </p>

            </div>


            {/* Filter Card */}
            <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-lg font-semibold mb-5">
                    Select Date
                </h2>

                <div className="flex flex-col sm:flex-row gap-4">

                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="
                            border
                            border-gray-300
                            rounded-lg
                            px-4
                            py-2
                            focus:outline-none
                            focus:ring-2
                            focus:ring-orange-500
                        "
                    />

                    <button
                        onClick={fetchRevenue}
                        disabled={loading}
                        className="
                            bg-orange-600
                            text-white
                            px-6
                            py-2
                            rounded-lg
                            hover:bg-orange-700
                            transition
                            disabled:opacity-50
                        "
                    >
                        {loading ? 'Loading...' : 'Get Report'}
                    </button>

                </div>

            </div>


            {/* Revenue Result */}

            {revenue && (

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                    {/* Total Orders */}

                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-gray-500">
                            Total Orders
                        </p>

                        <h2 className="text-3xl font-bold mt-2">
                            {revenue.totalOrders}
                        </h2>

                    </div>


                    {/* Total Revenue */}

                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-gray-500">
                            Total Revenue
                        </p>

                        <h2 className="text-3xl font-bold text-green-600 mt-2">
                            ₹{revenue.totalRevenue}
                        </h2>

                    </div>


                    {/* Date Range */}

                    <div className="bg-white rounded-xl shadow p-6 md:col-span-2">

                        <h3 className="font-semibold mb-3">
                            Report Period
                        </h3>

                        <div className="flex flex-col sm:flex-row gap-8 text-gray-600">

                            <p>
                                <span className="font-semibold text-gray-800">
                                    From:
                                </span>{' '}
                                {revenue.fromDate}
                            </p>

                            <p>
                                <span className="font-semibold text-gray-800">
                                    To:
                                </span>{' '}
                                {revenue.toDate}
                            </p>

                        </div>

                    </div>

                </div>

            )}

        </div>

    )
}

export default AdminDailyRevenue