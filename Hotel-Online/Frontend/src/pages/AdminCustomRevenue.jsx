import { useState } from 'react';
import api from '../api/axios';

function AdminCustomRevenue() {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [revenue, setRevenue] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchRevenue = async () => {
        if (!fromDate || !toDate) {
            alert('Please select both from and to dates');
            return;
        }

        if(fromDate > toDate) {
            alert('From date cannot be after To date');
            return;
        }

        try {
            setLoading(true);

            const res = await api.get(
                `/api/admin/orders/revenue/custom`,
                {
                    params: {
                        fromDate: fromDate,
                        toDate: toDate
                    }
                }
            );

            setRevenue(res.data);
        } catch (err) {
            console.error('Failed to fetch revenue', err);
            alert('Failed to fetch revenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Custom Revenue Report</h2>

            <div style={{ marginBottom: '15px' }}>
                <label>From: </label>
                <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>To: </label>
                <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                />
            </div>

            <button onClick={fetchRevenue}>Get Report</button>

            {loading && <p>Loading revenue...</p>}

            {revenue && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Report Result</h3>
                    <p><strong>From:</strong> {revenue.fromDate}</p>
                    <p><strong>To:</strong> {revenue.toDate}</p>
                    <p><strong>Total Orders:</strong> {revenue.totalOrders}</p>
                    <p><strong>Total Revenue:</strong> ₹{revenue.totalRevenue}</p>
                </div>
            )}
        </div>
    );
}

export default AdminCustomRevenue;
