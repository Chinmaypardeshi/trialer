import { useState } from 'react'
import api from '../api/axios'

function AdminExportExcel() {

    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')

    const exportToExcel = async () => {

        if (!fromDate || !toDate) {
            alert('Please select both from and to dates')
            return
        }

        try{

            const response = await api.get(
                `/api/admin/orders/export/excel?from=${fromDate}&to=${toDate}`,
                { responseType: 'blob' }
            )

            const url = window.URL.createObjectURL(new Blob([response.data]))

            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `orders.xlsx`)

            document.body.appendChild(link)
            link.click()
            link.remove()

        } catch (err) {
            console.error('Failed to export orders', err)
            alert('Failed to export orders')
        }
    }

    return (
        <div>
            <h2>Export Orders to Excel</h2>

            <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
            />

            <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ marginLeft: '10px' }}
            />

            <button onClick={exportToExcel} style={{ marginLeft: '10px' }}>
                Export to Excel
            </button>
        </div>
    )
}

export default AdminExportExcel
