
import { useState } from 'react'

import api from '../api/axios'

function AdminCustomRevenue() {

    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')
    const [revenue, setRevenue] = useState(null)
    const [loading, setLoading] = useState(false)

    const fetchRevenue = async () => {

        if (!fromDate || !toDate) {

            alert('Please select both from and to dates')
            return

        }

        if (fromDate > toDate) {

            alert('From date cannot be after To date')
            return

        }

        try {

            setLoading(true)

            // KEEPING YOUR EXISTING BACKEND API
            const res = await api.get(
                `/api/admin/orders/revenue/custom`,
                {
                    params: {
                        fromDate: fromDate,
                        toDate: toDate
                    }
                }
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
                    Custom Revenue
                </h1>

                <p className="text-gray-500 mt-1">
                    View revenue for a custom date range.
                </p>

            </div>

            {/* Date Selection */}
            <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-lg font-semibold mb-5">
                    Select Date Range
                </h2>

                <div className="flex flex-col sm:flex-row gap-4">

                    <div className="flex flex-col gap-2">

                        <label className="text-sm font-medium text-gray-600">
                            From Date
                        </label>

                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
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

                    </div>

                    <div className="flex flex-col gap-2">

                        <label className="text-sm font-medium text-gray-600">
                            To Date
                        </label>

                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
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

                    </div>

                    <div className="flex items-end">

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
                            {loading ? 'Loading...' : 'Get Custom Report'}
                        </button>

                    </div>

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

export default AdminCustomRevenue
