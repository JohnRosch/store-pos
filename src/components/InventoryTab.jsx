import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function InventoryTab({ products, setProducts }) {
  const [newProd, setNewProd] = useState({ name: '', cost: '', price: '', stock: '', threshold: '5' });
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  
  // Custom Glass Confirm State Layer
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, name: '' });
  
  const [animate, setAnimate] = useState({ standard: false, confirm: false });

  useEffect(() => {
    if (modal.isOpen) setTimeout(() => setAnimate(prev => ({ ...prev, standard: true })), 10);
    else setAnimate(prev => ({ ...prev, standard: false }));
  }, [modal.isOpen]);

  useEffect(() => {
    if (confirmModal.isOpen) setTimeout(() => setAnimate(prev => ({ ...prev, confirm: true })), 10);
    else setAnimate(prev => ({ ...prev, confirm: false }));
  }, [confirmModal.isOpen]);

  const triggerModal = (title, message, type = 'info') => {
    setModal({ isOpen: true, title, message, type });
  };

  const closeStandard = () => {
    setAnimate(prev => ({ ...prev, standard: false }));
    setTimeout(() => setModal({ ...modal, isOpen: false }), 200);
  };

  const closeConfirm = () => {
    setAnimate(prev => ({ ...prev, confirm: false }));
    setTimeout(() => setConfirmModal({ isOpen: false, id: null, name: '' }), 200);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await supabase.from('products').insert([{
        name: newProd.name,
        cost: parseFloat(newProd.cost) || 0,
        price: parseFloat(newProd.price) || 0,
        stock: parseInt(newProd.stock) || 0,
        threshold: parseInt(newProd.threshold) || 5
      }]);
      setNewProd({ name: '', cost: '', price: '', stock: '', threshold: '5' });
      if (typeof setProducts === 'function') setProducts(); 
      triggerModal('Product Registered', 'Item added to your cloud warehouse inventory shelf.', 'success');
    } catch (err) { 
      triggerModal('Cloud Failure', 'Could not sync database line items.', 'error'); 
    }
  };

  // Triggers the beautiful UI confirm screen instead of browser alert window
  const askDelete = (id, name) => {
    setConfirmModal({ isOpen: true, id, name });
  };

  const executeDelete = async () => {
    const { id } = confirmModal;
    try {
      await supabase.from('products').delete().eq('id', id);
      if (typeof setProducts === 'function') setProducts(); 
      closeConfirm();
      setTimeout(() => triggerModal('Item Removed', 'The item has been deleted from your cloud database.', 'info'), 250);
    } catch (err) { 
      closeConfirm();
      setTimeout(() => triggerModal('Cloud Error', 'Could not process deletion request.', 'error'), 250); 
    }
  };

    return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
      
      {/* 1. GLASS STATUS SUCCESS NOTIFICATION MODAL */}
      {modal.isOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-opacity duration-200 ease-out ${animate.standard ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl max-w-sm w-full p-6 text-center transition-all duration-200 ease-out transform ${animate.standard ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <div className="text-4xl mb-2">{modal.type === 'success' && '✅'}{modal.type === 'error' && '❌'}{modal.type === 'info' && '💡'}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{modal.title}</h3>
            <p className="text-sm text-gray-600 mb-5">{modal.message}</p>
            <button type="button" onClick={closeStandard} className="w-full bg-blue-600 text-white font-semibold py-2 rounded-xl shadow active:scale-95 transition-transform duration-100">Okay</button>
          </div>
        </div>
      )}

      {/* 2. NEW: GORGEOUS GLASS CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-opacity duration-200 ease-out ${animate.confirm ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl max-w-sm w-full p-6 text-center transition-all duration-200 ease-out transform ${animate.confirm ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <div className="text-4xl mb-2">🗑️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Product?</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete <span className="font-bold text-gray-900">"{confirmModal.name}"</span> permanently? This cannot be undone.</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={closeConfirm} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors">Cancel</button>
              <button type="button" onClick={executeDelete} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-all shadow active:scale-95">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTRATION FORM CONTAINER CARD */}
      <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl p-5 shadow-lg h-fit">
        <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">➕ Register Product</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <input type="text" required placeholder="Product Name" value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} className="w-full border border-gray-200 bg-white/60 rounded-xl p-2.5 text-sm outline-none" />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" required min="0" step="0.01" placeholder="Capital Cost" value={newProd.cost} onChange={(e) => setNewProd({ ...newProd, cost: e.target.value })} className="w-full border border-gray-200 bg-white/60 rounded-xl p-2.5 text-sm outline-none" />
            <input type="number" required min="0" step="0.01" placeholder="Selling Price" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} className="w-full border border-gray-200 bg-white/60 rounded-xl p-2.5 text-sm outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" required min="0" placeholder="Initial Stock" value={newProd.stock} onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })} className="w-full border border-gray-200 bg-white/60 rounded-xl p-2.5 text-sm outline-none" />
            <input type="number" min="0" placeholder="Alert Threshold" value={newProd.threshold} onChange={(e) => setNewProd({ ...newProd, threshold: e.target.value })} className="w-full border border-gray-200 bg-white/60 rounded-xl p-2.5 text-sm outline-none" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-xl text-sm shadow">Save to Cloud Inventory</button>
        </form>
      </div>

      {/* PRODUCTS DIRECTORY STOCK TABLE LEDGER CARD */}
      <div className="lg:col-span-2 bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl p-5 shadow-lg">
        <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">📦 Stock Ledger</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-gray-500 border-b"><th className="p-2">Item Name</th><th className="p-2">Cost</th><th className="p-2">Price</th><th className="p-2 text-center">Stock</th><th className="p-2 text-right">Actions</th></tr>
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
                    <td className="p-2 text-gray-600">₱{p.cost.toFixed(2)}</td>
                    <td className="p-2 font-bold text-blue-600">₱{p.price.toFixed(2)}</td>
                    <td className="p-2 text-center font-bold text-gray-800">{p.stock}</td>
                    <td className="p-2 text-right">
                      <button type="button" onClick={() => askDelete(p.id, p.name)} className="bg-red-50 border border-red-200 text-red-600 px-2 py-1 rounded-lg text-xs font-bold hover:bg-red-100 transition-all duration-150">🗑️ Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
