import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import StockTable from './StockTable'; // Imports our lightweight table file

export default function InventoryTab({ products, setProducts }) {
  const [newProd, setNewProd] = useState({ name: '', cost: '', price: '', stock: '', threshold: '5', category: 'Grocery' });
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, name: '' });
  const [promptModal, setPromptModal] = useState({ isOpen: false, id: null, name: '', value: '' });
  const [animate, setAnimate] = useState({ standard: false, confirm: false, prompt: false });

  // LIVE CALCULATOR LOGIC
  const costNum = parseFloat(newProd.cost) || 0;
  const priceNum = parseFloat(newProd.price) || 0;
  const pesosProfit = priceNum - costNum;
  const marginPercentage = priceNum > 0 ? (pesosProfit / priceNum) * 100 : 0;

  useEffect(() => {
    if (modal.isOpen) setTimeout(() => setAnimate(prev => ({ ...prev, standard: true })), 10);
    else setAnimate(prev => ({ ...prev, standard: false }));
  }, [modal.isOpen]);

  useEffect(() => {
    if (confirmModal.isOpen) setTimeout(() => setAnimate(prev => ({ ...prev, confirm: true })), 10);
    else setAnimate(prev => ({ ...prev, confirm: false }));
  }, [confirmModal.isOpen]);

  useEffect(() => {
    if (promptModal.isOpen) setTimeout(() => setAnimate(prev => ({ ...prev, prompt: true })), 10);
    else setAnimate(prev => ({ ...prev, prompt: false }));
  }, [promptModal.isOpen]);

  const triggerModal = (title, message, type = 'info') => { setModal({ isOpen: true, title, message, type }); };
  const closeStandard = () => { setAnimate(prev => ({ ...prev, standard: false })); setTimeout(() => setModal({ ...modal, isOpen: false }), 200); };
  const closeConfirm = () => { setAnimate(prev => ({ ...prev, confirm: false })); setTimeout(() => setConfirmModal({ isOpen: false, id: null, name: '' }), 200); };
  const closePrompt = () => { setAnimate(prev => ({ ...prev, prompt: false })); setTimeout(() => setPromptModal({ isOpen: false, id: null, name: '', value: '' }), 200); };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await supabase.from('products').insert([{
        name: newProd.name, cost: parseFloat(newProd.cost) || 0, price: parseFloat(newProd.price) || 0,
        stock: parseInt(newProd.stock) || 0, threshold: parseInt(newProd.threshold) || 5, category: newProd.category 
      }]);
      setNewProd({ name: '', cost: '', price: '', stock: '', threshold: '5', category: 'Grocery' });
      if (typeof setProducts === 'function') setProducts(); 
      triggerModal('Product Registered', 'Item added to your cloud warehouse inventory shelf.', 'success');
    } catch (err) { triggerModal('Cloud Failure', 'Could not sync database line items.', 'error'); }
  };

  const askDelete = (id, name) => { setConfirmModal({ isOpen: true, id, name }); };

  const executeDelete = async () => {
    const { id } = confirmModal;
    try {
      await supabase.from('products').delete().eq('id', id);
      if (typeof setProducts === 'function') setProducts(); 
      closeConfirm();
      setTimeout(() => triggerModal('Item Removed', 'The item has been deleted from your cloud database.', 'info'), 250);
    } catch (err) { closeConfirm(); triggerModal('Cloud Error', 'Could not process deletion request.', 'error'); }
  };

  const askRestock = (id, name) => { setPromptModal({ isOpen: true, id, name, value: '' }); };

  const executeRestock = async (e) => {
    e.preventDefault();
    const parsed = parseInt(promptModal.value);
    if (isNaN(parsed) || parsed <= 0) return triggerModal('Invalid Amount', 'Please input a number greater than 0.', 'warning');
    try {
      const targetProd = products.find(p => p.id === promptModal.id);
      if (targetProd) {
        const newStockCount = targetProd.stock + parsed;
        await supabase.from('products').update({ stock: newStockCount }).eq('id', promptModal.id);
        if (typeof setProducts === 'function') setProducts(); 
        closePrompt();
        setTimeout(() => triggerModal('Stock Updated', `Successfully added ${parsed} pieces to inventory.`, 'success'), 250);
      }
    } catch (err) { closePrompt(); triggerModal('Sync Failed', 'Could not connect to cloud database.', 'error'); }
  };

    return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
      {/* 1. STATUS NOTIFICATION MODAL */}
      {modal.isOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-opacity duration-200 ease-out ${animate.standard ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl max-w-sm w-full p-6 text-center transition-all duration-200 ease-out transform ${animate.standard ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <div className="text-4xl mb-2">{modal.type === 'success' && '✅'}{modal.type === 'error' && '❌'}{modal.type === 'info' && '💡'}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{modal.title}</h3>
            <p className="text-sm text-gray-600 mb-5">{modal.message}</p>
            <button type="button" onClick={closeStandard} className="w-full bg-blue-600 text-white font-semibold py-2 rounded-xl shadow">Okay</button>
          </div>
        </div>
      )}

      {/* 2. CONFIRM DELETE MODAL */}
      {confirmModal.isOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-opacity duration-200 ease-out ${animate.confirm ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl max-w-sm w-full p-6 text-center transition-all duration-200 ease-out transform ${animate.confirm ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <div className="text-4xl mb-2">🗑️</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Product?</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete <span className="font-bold text-gray-900">"{confirmModal.name}"</span> permanently?</p>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={closeConfirm} className="bg-gray-100 py-2 rounded-xl">Cancel</button>
              <button type="button" onClick={executeDelete} className="bg-red-50 text-white py-2 rounded-xl shadow">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* 3. PROMPT RESTOCK GLASS MODAL */}
      {promptModal.isOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-opacity duration-200 ease-out ${animate.prompt ? 'opacity-100' : 'opacity-0'}`}>
          <form onSubmit={executeRestock} className={`bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl max-w-sm w-full p-6 text-center transition-all duration-200 ease-out transform ${animate.prompt ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <div className="text-4xl mb-2">📦</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Restock Item</h3>
            <p className="text-sm text-gray-600 mb-4">How many additional pieces of <span className="font-bold text-gray-900">"{promptModal.name}"</span> to add?</p>
            <input type="number" required placeholder="Enter pieces count" min="1" value={promptModal.value} onChange={(e) => setPromptModal({ ...promptModal, value: e.target.value })} className="w-full border border-gray-200 bg-white p-2.5 rounded-xl text-center font-bold text-lg mb-5 outline-none focus:ring-2 focus:ring-blue-500/20" />
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={closePrompt} className="bg-gray-100 py-2 rounded-xl">Cancel</button>
              <button type="submit" className="bg-blue-600 text-white py-2 rounded-xl shadow">Update</button>
            </div>
          </form>
        </div>
      )}

      {/* REGISTRATION FORM WITH EMBEDDED PROFIT MARGIN CHIP COMPONENT */}
      <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl p-5 shadow-lg h-fit">
        <h2 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">➕ Register Product</h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <input type="text" required placeholder="Product Name" value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} className="w-full border border-gray-200 bg-white/60 rounded-xl p-2.5 text-sm outline-none focus:bg-white transition-all" />
          
          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Product Category</label>
            <select value={newProd.category} onChange={(e) => setNewProd({ ...newProd, category: e.target.value })} className="w-full border border-gray-200 bg-white/60 rounded-xl p-2.5 text-sm outline-none cursor-pointer focus:bg-white transition-all font-semibold text-gray-700">
              <option value="Rice">🍚 Rice</option>
              <option value="Egg">🥚 Egg</option>
              <option value="Grocery">🥫 Grocery</option>
              <option value="Non-Food">🧼 Non-Food</option>
              <option value="Etc">📦 Etc</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input type="number" required min="0" step="0.01" placeholder="Capital Cost" value={newProd.cost} onChange={(e) => setNewProd({ ...newProd, cost: e.target.value })} className="w-full border border-gray-200 bg-white/60 rounded-xl p-2.5 text-sm outline-none focus:bg-white transition-all" />
            <input type="number" required min="0" step="0.01" placeholder="Selling Price" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} className="w-full border border-gray-200 bg-white/60 rounded-xl p-2.5 text-sm outline-none focus:bg-white transition-all" />
          </div>

          {/* DYNAMIC PROFIT MARGIN CHIP COMPONENT */}
          {costNum > 0 && priceNum > 0 && (
            <div className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all duration-300 shadow-2xs ${
              pesosProfit > 0 ? (marginPercentage >= 15 ? 'bg-green-50 text-green-700 border-green-200/60' : 'bg-amber-50 text-amber-700 border-amber-200/60') : 'bg-red-50 text-red-600 border-red-200/60'
            }`}>
              {pesosProfit > 0 ? (
                <p>📈 Profit: <span className="font-extrabold">+₱{pesosProfit.toFixed(2)}</span> ({marginPercentage.toFixed(1)}% Margin)</p>
              ) : pesosProfit === 0 ? (
                <p>⚖️ Break-Even: No Profit / No Loss</p>
              ) : (
                <p>🚨 Loss Warning: Selling below capital cost by ₱{Math.abs(pesosProfit).toFixed(2)}!</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <input type="number" required min="0" placeholder="Initial Stock" value={newProd.stock} onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })} className="w-full border border-gray-200 bg-white/60 rounded-xl p-2.5 text-sm outline-none focus:bg-white transition-all" />
            <input type="number" min="0" placeholder="Alert Threshold" value={newProd.threshold} onChange={(e) => setNewProd({ ...newProd, threshold: e.target.value })} className="w-full border border-gray-200 bg-white/60 rounded-xl p-2.5 text-sm outline-none focus:bg-white transition-all" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-xl text-sm shadow active:scale-[0.99] transition-all">Save to Cloud Inventory</button>
        </form>
      </div>

      {/* Renders the child table component safely without file limits */}
      <StockTable products={products} askRestock={askRestock} askDelete={askDelete} />
    </div>
  );
}
