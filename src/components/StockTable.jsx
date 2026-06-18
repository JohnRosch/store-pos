import React from 'react';

export default function StockTable({ products, askRestock, askDelete }) {
  return (
    <div className="lg:col-span-2 bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl p-5 shadow-lg">
      <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">📦 Stock Ledger</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="p-2">Item Name</th>
              <th className="p-2">Category</th>
              <th className="p-2">Price</th>
              <th className="p-2 text-center">Stock</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 ? (
              <tr><td colSpan="5" className="p-4 text-center text-gray-400">No products inside cloud. Add one on the left!</td></tr>
            ) : (
              products.map(p => (
                <tr key={p.id} className="hover:bg-white/40 transition-colors">
                  <td className="p-2 font-semibold text-gray-800">
                    <div>{p.name}</div>
                    {p.stock <= p.threshold && <span className="text-[9px] text-amber-700 bg-amber-100 px-1 rounded font-bold">⚠️ REORDER</span>}
                  </td>
                  <td className="p-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{p.category || 'Grocery'}</td>
                  <td className="p-2 font-bold text-blue-600">₱{p.price.toFixed(2)}</td>
                  <td className="p-2 text-center font-bold text-gray-800">{p.stock}</td>
                  <td className="p-2 text-right space-x-1 whitespace-nowrap">
                    <button type="button" onClick={() => askRestock(p.id, p.name)} className="bg-blue-50 border border-blue-200 text-blue-600 px-2 py-1 rounded-lg text-xs font-bold hover:bg-blue-100">+ Restock</button>
                    <button type="button" onClick={() => askDelete(p.id, p.name)} className="bg-red-50 border border-red-200 text-red-600 px-2 py-1 rounded-lg text-xs font-bold hover:bg-red-100">🗑️ Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
