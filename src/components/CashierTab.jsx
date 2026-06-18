import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function CashierTab({ products, cart, setCart, salesLog, setSalesLog, utangLog, setUtangLog, searchQuery, setSearchQuery, cashReceived, setCashReceived, customerName, setCustomerName, isUtangTransaction, setIsUtangTransaction }) {
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [animate, setAnimate] = useState(false);
  
  // Active folder view tracker
  const [selectedCategory, setSelectedCategory] = useState('All');

  const triggerModal = (title, message, type = 'info') => { setModal({ isOpen: true, title, message, type }); };
  
  useEffect(() => {
    if (modal.isOpen) setTimeout(() => setAnimate(true), 10);
    else setAnimate(false);
  }, [modal.isOpen]);

  const closeModal = () => {
    setAnimate(false);
    setTimeout(() => setModal({ ...modal, isOpen: false }), 200);
  };

  const addToCart = (product) => {
    if (product.stock <= 0) return triggerModal('Out of Stock', `Sorry, ${product.name} is out of stock.`, 'error');
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) return triggerModal('Limit Reached', `Only ${product.stock} pieces left.`, 'warning');
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, change) => {
    const item = cart.find(i => i.id === id);
    const prod = products.find(p => p.id === id);
    if (!item) return;
    const newQty = item.quantity + change;
    if (newQty <= 0) {
      setCart(cart.filter(i => i.id !== id));
    } else if (newQty > prod.stock) {
      triggerModal('Insufficient Stock', `Only ${prod.stock} pieces available.`, 'warning');
    } else {
      setCart(cart.map(i => i.id === id ? { ...i, quantity: newQty } : i));
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const changeDue = cashReceived ? parseFloat(cashReceived) - cartTotal : 0;
  
  const billString = "5,10,20,50,100,500,1000";
  const bills = billString.split(',').map(Number);

  // FIXED: Your precise requested product category array list
  const categoriesList = ['All', 'Rice', 'Egg', 'Grocery', 'Non-Food', 'Etc'];

  // FILTER CORE: Evaluates text query strings against exact category allocations
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return triggerModal('Empty Cart', 'Please add items before checking out.', 'warning');
    if (isUtangTransaction && !customerName.trim()) return triggerModal('Missing Info', 'Please enter customer name.', 'warning');
    if (!isUtangTransaction && (parseFloat(cashReceived) < cartTotal || !cashReceived)) return triggerModal('Insufficient Payment', 'Cash received is less than total due.', 'error');

    try {
      for (const item of cart) {
        const currentProd = products.find(p => p.id === item.id);
        if (currentProd) {
          const newStockCount = currentProd.stock - item.quantity;
          await supabase.from('products').update({ stock: newStockCount }).eq('id', item.id);
        }
      }

      const itemsString = cart.map(i => `${i.name} (${i.quantity}x)`).join(', ');
      const profitCalculated = cart.reduce((sum, i) => sum + ((i.price - i.cost) * i.quantity), 0);
      const transactionType = isUtangTransaction ? `Utang (${customerName})` : 'Cash';

      await supabase.from('sales').insert([{
        items: itemsString,
        total: cartTotal,
        profit: profitCalculated,
        type: transactionType
      }]);

      if (isUtangTransaction) {
        await supabase.from('utang').insert([{
          customer: customerName,
          amount: cartTotal
        }]);
      }

      setCart([]); setCashReceived(''); setCustomerName(''); setIsUtangTransaction(false);
      if (typeof setSalesLog === 'function') setSalesLog();
      triggerModal('Success!', 'Transaction uploaded and cloud inventory levels updated permanently.', 'success');
    } catch (error) {
      console.error(error);
      triggerModal('Cloud Sync Error', 'Could not sync database records.', 'error');
    }
  };

    return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative items-start">
      {/* MODAL LAYER POPUPS */}
      {modal.isOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md transition-opacity duration-200 ease-out ${animate ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl max-w-sm w-full p-6 text-center transition-all duration-200 ease-out transform ${animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <div className="text-4xl mb-2">{modal.type === 'success' && '✅'}{modal.type === 'error' && '❌'}{modal.type === 'warning' && '⚠️'}{modal.type === 'info' && '💡'}</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{modal.title}</h3>
            <p className="text-sm text-gray-600 mb-5">{modal.message}</p>
            <button type="button" onClick={closeModal} className="w-full bg-blue-600 text-white font-semibold py-2 rounded-xl shadow">Okay</button>
          </div>
        </div>
      )}

      {/* LEFT: PRODUCTS SIDE SHELF */}
      <div className="lg:col-span-2 bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl p-5 shadow-lg flex flex-col">
        <input type="text" placeholder="🔍 Search item name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full border border-gray-200 bg-white/60 pl-4 py-2.5 rounded-xl outline-none mb-3" />
        
        {/* PREMIUM HORIZONTAL CATEGORY NAVIGATION FILTER BAR WITH CUSTOM TARGETED EMOJIS */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-3 mb-2 scrollbar-none bg-gray-100/40 p-1 rounded-xl border border-gray-200/40">
          {categoriesList.map(cat => (
            <button key={cat} type="button" onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-150 active:scale-95 shadow-2xs ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-white/80 text-gray-600 hover:text-gray-900 hover:bg-white'}`}>
              {cat === 'All' ? '🌐 All Items' : cat === 'Rice' ? '🍚 Rice' : cat === 'Egg' ? '🥚 Egg' : cat === 'Grocery' ? '🥫 Grocery' : cat === 'Non-Food' ? '🧼 Non-Food' : '📦 Etc'}
            </button>
          ))}
        </div>

        {/* 4-COLUMN COMPACT RESPONSIVE TILES GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 items-start content-start">
          {filteredProducts.map(p => (
            <button key={p.id} onClick={() => addToCart(p)} className="p-3 w-full h-[95px] border border-gray-200/50 rounded-xl text-left flex flex-col justify-between hover:border-blue-500 hover:shadow-sm transition bg-white/70 backdrop-blur-sm relative overflow-hidden group">
              {p.stock <= p.threshold && p.stock > 0 && <span className="absolute top-1 right-1 bg-amber-500 text-white text-[8px] px-1 rounded font-bold animate-pulse">LOW</span>}
              {p.stock === 0 && <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex items-center justify-center font-bold text-red-500 text-xs">OUT</div>}
              
              <div className="w-full">
                <span className="font-bold text-gray-800 text-xs line-clamp-2 leading-tight block">{p.name}</span>
              </div>
              
              <div className="w-full flex justify-between items-baseline mt-auto border-t border-gray-100/60 pt-1">
                <span className="text-blue-600 font-black text-xs">₱{p.price.toFixed(0)}</span>
                <span className="text-[10px] text-gray-400 font-medium">Qty: {p.stock}</span>
              </div>
            </button>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-12 text-xs font-semibold">No products inside this category.</div>
          )}
        </div>
      </div>

      {/* RIGHT: ACCOUNTING/SUMMARY BILLING BOX */}
      <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl p-5 shadow-lg flex flex-col justify-between h-fit">
        <div>
          <div className="flex justify-between items-center border-b pb-3 mb-4"><h2 className="text-base font-bold text-gray-800">Current Order</h2><button type="button" onClick={() => setCart([])} className="text-xs text-red-500 font-semibold">Clear All</button></div>
          {cart.length === 0 ? <div className="text-center text-gray-400 py-12 flex flex-col items-center"><span className="text-4xl mb-2 opacity-50">🛒</span><p className="text-sm">Cart is empty.</p></div> : (
            <div className="space-y-3 max-h-56 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm bg-white/50 border border-gray-100 p-2 rounded-xl">
                  <div className="flex-1 min-w-0 pr-2"><p className="font-semibold text-gray-800 truncate">{item.name}</p><p className="text-xs text-blue-500 font-bold">₱{item.price}</p></div>
                  <div className="flex items-center space-x-1.5 bg-gray-100 p-0.5 rounded-lg">
                    <button type="button" onClick={() => updateQuantity(item.id, -1)} className="bg-white w-5 h-5 flex items-center justify-center rounded font-bold shadow-xs">-</button>
                    <span className="font-bold text-xs w-4 text-center">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, 1)} className="bg-white w-5 h-5 flex items-center justify-center rounded font-bold shadow-xs">+</button>
                  </div>
                  <span className="w-16 text-right font-bold text-gray-800 ml-2">₱{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
          <div className="flex justify-between items-center mb-4"><span className="text-sm font-semibold text-gray-500">Total Due:</span><span className="text-2xl font-black text-blue-600">₱{cartTotal.toFixed(2)}</span></div>
          <form onSubmit={handleCheckout} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
              <button type="button" onClick={() => setIsUtangTransaction(false)} className={`py-1.5 rounded-lg text-xs font-bold ${!isUtangTransaction ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>💵 Cash</button>
              <button type="button" onClick={() => setIsUtangTransaction(true)} className={`py-1.5 rounded-lg text-xs font-bold ${isUtangTransaction ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500'}`}>📝 Utang</button>
            </div>
            {!isUtangTransaction ? (
              <div className="space-y-2">
                <input type="number" min="0" placeholder="₱ 0.00" value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} className="w-full border border-gray-200 bg-white/80 p-2.5 rounded-xl text-xl font-black text-green-700 text-center outline-none" />
                <div className="grid grid-cols-4 gap-1">{bills.map(amt => (<button key={amt} type="button" onClick={() => setCashReceived(((parseFloat(cashReceived) || 0) + amt).toString())} className="bg-white hover:bg-blue-50 border border-gray-200 text-gray-700 font-bold py-1 rounded-lg text-xs shadow-xs active:scale-95 transition-all">+{amt}</button>))}</div>
                
                {cashReceived && (
                  <div className={`text-center p-4 rounded-xl mt-3 border-2 shadow-inner tracking-wide transition-all duration-300 ${
                    changeDue >= 0 
                      ? 'bg-amber-400 text-slate-900 border-amber-500 text-xl font-black shadow-amber-500/20' 
                      : 'bg-red-600 text-white border-red-700 text-sm font-bold'
                  }`}>
                    {changeDue >= 0 
                      ? `💰 SUKLI / CHANGE: ₱${changeDue.toFixed(2)}` 
                      : `⚠️ KULANG / LACKING: ₱${Math.abs(changeDue).toFixed(2)}`
                    }
                  </div>
                )}
              </div>
            ) : (
              <input type="text" placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full border border-gray-200 bg-white/80 p-2.5 rounded-xl text-sm outline-none" />
            )}
            <button type="submit" disabled={cart.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl shadow-md transition">Complete Transaction</button>
          </form>
        </div>
      </div>
    </div>
  );
}
