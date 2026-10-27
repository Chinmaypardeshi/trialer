
import { useState } from 'react'
import api from '../api/axios'

function AdminMonthlyRevenue() {

    const [year, setYear] = useState('')
    const [month, setMonth] = useState('')
    const [revenue, setRevenue] = useState(null)
    const [loading, setLoading] = useState(false)

    const fetchRevenue = async () => {

        if (!year || !month) {
            alert('Please select both year and month')
            return
        }

        try {

            setLoading(true)

            // KEEPING YOUR EXISTING BACKEND API
            const res = await api.get(
                `/api/admin/orders/revenue/monthly?year=${year}&month=${month}`
            )

            setRevenue(res.data)

        } catch (err) {

            console.error(err)
            alert('Failed to fetch monthly revenue')

        } finally {

            setLoading(false)

        }
    }

    return (

        <div className="space-y-8">

            {/* Page Heading */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800">
                    Monthly Revenue
                </h1>

                <p className="text-gray-500 mt-1">
                    View revenue for a selected month.
                </p>
            </div>

            {/* Month Selection */}
            <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-lg font-semibold mb-5">
                    Select Month
                </h2>

                <div className="flex flex-col sm:flex-row gap-4">

                    <input
                        type="number"
                        placeholder="Year (e.g., 2026)"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
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

                    <input
                        type="number"
                        placeholder="Month (1-12)"
                        min="1"
                        max="12"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
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
                        {loading ? 'Loading...' : 'Get Monthly Report'}
                    </button>

                </div>

            </div>

            {/* Results */}
            {revenue && (

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Total Orders */}
                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-gray-500">
                            Total Orders
                        </p>

                        <h2 className="text-4xl font-bold mt-2">
                            {revenue.totalOrders}
                        </h2>

                    </div>

                    {/* Total Revenue */}
                    <div className="bg-white rounded-xl shadow p-6">

                        <p className="text-gray-500">
                            Total Revenue
                        </p>

                        <h2 className="text-4xl font-bold text-green-600 mt-2">
                            ₹{revenue.totalRevenue}
                        </h2>

                    </div>

                    {/* Report Period */}
                    <div className="bg-white rounded-xl shadow p-6 md:col-span-2">

                        <h3 className="text-lg font-semibold mb-4">
                            Report Period
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                            <div>

                                <p className="text-sm text-gray-500">
                                    From
                                </p>

                                <p className="font-semibold text-lg">
                                    {revenue.fromDate}
                                </p>

                            </div>

                            <div>

                                <p className="text-sm text-gray-500">
                                    To
                                </p>

                                <p className="font-semibold text-lg">
                                    {revenue.toDate}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>

    )
}

export default AdminMonthlyRevenue
