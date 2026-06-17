import React from 'react';
import { supabase } from '../supabaseClient';

export default function ReportsAndUtangTab({ activeTab, products, salesLog, utangLog, setUtangLog }) {
  
  const handlePayUtang = async (id) => {
    if (confirm('Mark this customer balance tab as fully paid?')) {
      try {
        await supabase.from('utang').delete().eq('id', id);
        if (typeof setUtangLog === 'function') setUtangLog(); 
        alert('Utang cleared successfully.');
      } catch (err) { 
        alert('Cloud deletion failed.'); 
      }
    }
  };

  const downloadDailyReport = () => {
    const today = new Date().toISOString().split('T')[0];
    
    const todaysSales = salesLog.filter(s => {
      if (!s.created_at) return false;
      return s.created_at.split('T')[0] === today;
    });

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `SARI-SARI STORE REPORT (${today})\n\n--- TODAY'S SALES RECORD ---\nItems,Total Revenue,Net Profit,Payment Method\n`;
    
    todaysSales.forEach(s => { 
      const cleanTime = s.created_at ? new Date(s.created_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : '';
      csvContent += `"${s.items} [${cleanTime}]",₱${s.total},₱${s.profit},${s.type}\n`; 
    });
    
    csvContent += `\n--- CURRENT INVENTORY STATUS ---\nItem,Cost,Price,Stock\n`;
    products.forEach(p => { csvContent += `"${p.name}",₱${p.cost},₱${p.price},${p.stock}\n`; });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `StoreCloudReport_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (activeTab === 'reports') {
    return (
      <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-lg space-y-6">
        <div className="flex flex-wrap justify-between items-center border-b pb-4 gap-4">
          <h2 className="text-xl font-black text-gray-800">Sales Analytics Ledger</h2>
          <button onClick={downloadDailyReport} className="bg-green-600 text-white font-bold py-2 px-4 rounded-xl shadow">📥 Download CSV Status</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50/60 p-4 rounded-xl border">
            <p className="text-xs font-bold text-blue-600">TOTAL REVENUE</p>
            <p className="text-2xl font-black text-blue-900 mt-1">₱{salesLog.reduce((sum, s) => sum + Number(s.total || 0), 0).toFixed(2)}</p>
          </div>
          <div className="bg-green-50/60 p-4 rounded-xl border">
            <p className="text-xs font-bold text-green-600">NET PROFIT</p>
            <p className="text-2xl font-black text-green-900 mt-1">₱{salesLog.reduce((sum, s) => sum + Number(s.profit || 0), 0).toFixed(2)}</p>
          </div>
          <div className="bg-purple-50/60 p-4 rounded-xl border">
            <p className="text-xs font-bold text-purple-600">ORDERS RECORDED</p>
            <p className="text-2xl font-black text-purple-900 mt-1">{salesLog.length}</p>
          </div>
        </div>

        {/* SALES LOG AUDIT TRAIL TABLE */}
        <div className="bg-white rounded-xl border overflow-hidden shadow-xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b text-gray-500 font-semibold">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Items Sold</th>
                <th className="p-3">Type</th>
                <th className="p-3">Total</th>
                <th className="p-3">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {salesLog.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center text-gray-400">No sales transactions logged yet.</td></tr>
              ) : (
                salesLog.map(s => {
                  const timestamp = s.created_at ? new Date(s.created_at).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : '';
                  return (
                    <tr key={s.id} className="hover:bg-gray-50/50">
                      <td className="p-3 text-xs text-gray-400">{timestamp}</td>
                      <td className="p-3 font-semibold text-gray-800">{s.items}</td>
                      <td className="p-3 text-xs"><span className={`px-2 py-0.5 rounded-full font-bold ${s.type.startsWith('Utang') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{s.type}</span></td>
                      <td className="p-3 font-bold text-gray-900">₱{Number(s.total).toFixed(2)}</td>
                      <td className="p-3 font-bold text-green-600">+₱{Number(s.profit).toFixed(2)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl p-5 shadow-lg">
      <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">📝 Credit Balance Ledger (Utang)</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr className="text-gray-500 border-b"><th className="p-2">Customer Name</th><th className="p-2">Balance Due</th><th className="p-2 text-right">Action</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {utangLog.length === 0 ? <tr><td colSpan="3" className="p-4 text-center text-gray-400">No outstanding customer tabs on file.</td></tr> :
              utangLog.map(u => (
                <tr key={u.id} className="hover:bg-red-50/40"><td className="p-2 font-bold text-gray-800">👤 {u.customer}</td><td className="p-2 text-red-600 font-black">₱{Number(u.amount).toFixed(2)}</td><td className="p-2 text-right"><button type="button" onClick={() => handlePayUtang(u.id)} className="bg-green-100 text-green-700 font-bold px-3 py-1 rounded-lg text-xs">✓ Paid</button></td></tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
