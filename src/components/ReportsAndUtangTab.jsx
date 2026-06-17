import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ReportsAndUtangTab({ activeTab, products, salesLog, utangLog, setUtangLog }) {
  // DATE FILTER MODIFIER HOOK STATES: 'today', 'yesterday', 'week', 'month', 'all'
  const [dateFilter, setDateFilter] = useState('today');

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

  // Safe timezone helper to calculate dynamic intervals 
  const getLocalDateString = (daysOffset = 0) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysOffset);
    const tzOffset = targetDate.getTimezoneOffset() * 60000;
    return new Date(targetDate.getTime() - tzOffset).toISOString().split('T')[0];
  };

  const todayStr = getLocalDateString(0);
  const yesterdayStr = getLocalDateString(1);

  // HIGH-EFFICIENCY LOG FILTERS CORES ENGINE
  const filteredSales = salesLog.filter(s => {
    if (!s.created_at) return false;
    const saleDateStr = s.created_at.split('T')[0];

    if (dateFilter === 'today') {
      return saleDateStr === todayStr;
    }
    if (dateFilter === 'yesterday') {
      return saleDateStr === yesterdayStr;
    }
    if (dateFilter === 'week') {
      const saleDate = new Date(saleDateStr);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return saleDate >= sevenDaysAgo;
    }
    if (dateFilter === 'month') {
      // NEW ADDITION: Checks if sale month and year match the current calendar period
      const saleDate = new Date(saleDateStr);
      const currentDate = new Date();
      return saleDate.getMonth() === currentDate.getMonth() && saleDate.getFullYear() === currentDate.getFullYear();
    }
    return true; // 'all' time dashboard tracking fallback
  });

  const downloadDailyReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `SARI-SARI STORE SALES REPORT (${dateFilter.toUpperCase()} VIEW)\n\n`;
    csvContent += "--- TRANSACTIONS LOG ---\nDate/Time,Items Sold,Type,Total,Profit\n";
    
    filteredSales.forEach(s => { 
      const cleanTime = s.created_at ? new Date(s.created_at).toLocaleString('en-PH', { dateStyle: 'short', timeStyle: 'short' }) : '';
      csvContent += `"${cleanTime}","${s.items}",${s.type},₱${s.total},₱${s.profit}\n`; 
    });
    
    csvContent += `\n--- CURRENT INVENTORY ---\nItem,Cost,Price,Stock\n`;
    products.forEach(p => { csvContent += `"${p.name}",₱${p.cost},₱${p.price},${p.stock}\n`; });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `StoreReport_${dateFilter}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (activeTab === 'reports') {
    return (
      <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl p-6 shadow-lg space-y-6">
        <div className="flex flex-wrap justify-between items-center border-b pb-4 gap-4">
          <div>
            <h2 className="text-xl font-black text-gray-800">Sales Dashboard</h2>
            <p className="text-xs text-gray-400">Review business velocity analytics cleanly without data manipulation.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* EXPANDED SMART DATA CHIPS INTERFACES */}
            <div className="bg-gray-200/80 p-1 rounded-xl flex space-x-1 border border-gray-300/30 text-xs font-bold">
              <button onClick={() => setDateFilter('today')} className={`px-3 py-1.5 rounded-lg transition-all ${dateFilter === 'today' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Today</button>
              <button onClick={() => setDateFilter('yesterday')} className={`px-3 py-1.5 rounded-lg transition-all ${dateFilter === 'yesterday' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Yesterday</button>
              <button onClick={() => setDateFilter('week')} className={`px-3 py-1.5 rounded-lg transition-all ${dateFilter === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Past 7 Days</button>
              {/* NEW SELECTOR CHIP INTERFACE BUTTON */}
              <button onClick={() => setDateFilter('month')} className={`px-3 py-1.5 rounded-lg transition-all ${dateFilter === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>This Month</button>
              <button onClick={() => setDateFilter('all')} className={`px-3 py-1.5 rounded-lg transition-all ${dateFilter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>All Time</button>
            </div>

            <button onClick={downloadDailyReport} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl shadow active:scale-95 transition-all text-xs">📥 Download Filtered CSV</button>
          </div>
        </div>

        {/* METRICS ACCUMULATORS PANEL ROWS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 shadow-xs">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Total Revenue ({dateFilter === 'month' ? 'this month' : dateFilter})</p>
            <p className="text-2xl font-black text-blue-900 mt-1">₱{filteredSales.reduce((sum, s) => sum + Number(s.total || 0), 0).toFixed(2)}</p>
          </div>
          <div className="bg-green-50/60 p-4 rounded-xl border border-green-100 shadow-xs">
            <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Net Profit ({dateFilter === 'month' ? 'this month' : dateFilter})</p>
            <p className="text-2xl font-black text-green-900 mt-1">₱{filteredSales.reduce((sum, s) => sum + Number(s.profit || 0), 0).toFixed(2)}</p>
          </div>
          <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 shadow-xs">
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">Orders Logged ({dateFilter === 'month' ? 'this month' : dateFilter})</p>
            <p className="text-2xl font-black text-purple-900 mt-1">{filteredSales.length} records</p>
          </div>
        </div>

        {/* HISTORICAL TABLE DIRECTORY SHEET */}
        <div className="bg-white rounded-xl border overflow-hidden shadow-xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b text-gray-500 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3">Date / Time</th>
                <th className="p-3">Items Sold</th>
                <th className="p-3">Type</th>
                <th className="p-3">Total</th>
                <th className="p-3">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-700">
              {filteredSales.length === 0 ? (
                <tr><td colSpan="5" className="p-5 text-center text-gray-400">No transaction logs match this filter period.</td></tr>
              ) : (
                filteredSales.map(s => {
                  const timestamp = s.created_at ? new Date(s.created_at).toLocaleString('en-PH', { dateStyle: 'short', timeStyle: 'short' }) : '';
                  return (
                    <tr key={s.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="p-3 text-xs text-gray-400 font-mono">{timestamp}</td>
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
