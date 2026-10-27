import { useState } from 'react'
import api from '../api/axios'

function AdminExportPdf() {


    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')

    const exportPdf = async () => {

        if (!fromDate || !toDate) {
            alert('Please select both dates')
            return
        }

        try {

            const res = await api.get(
                `/api/admin/orders/test?fromDate=${fromDate}&toDate=${toDate}`,
                { responseType: 'blob' }
            )

            const url = window.URL.createObjectURL(new Blob([res.data]))

            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'paid-orders.pdf')

            document.body.appendChild(link)
            link.click()
            link.remove()

        } catch (err) {
            console.error(err)
            alert('Failed to export PDF')
        }
    }

    return (
        <div>
            <h2>Export Paid Orders PDF</h2>

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

            <button onClick={exportPdf} style={{ marginLeft: '10px' }}>
                Download PDF
            </button>
        </div>
    )
}

export default AdminExportPdf
