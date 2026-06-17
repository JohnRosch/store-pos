import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Connected to your cloud instance
import CashierTab from './components/CashierTab';
import InventoryTab from './components/InventoryTab';
import ReportsAndUtangTab from './components/ReportsAndUtangTab';

export default function App() {
  const [activeTab, setActiveTab] = useState('cashier');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [cashReceived, setCashReceived] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isUtangTransaction, setIsUtangTransaction] = useState(false);

  // States managed globally but synced directly from the cloud db
  const [products, setProducts] = useState([]);
  const [salesLog, setSalesLog] = useState([]);
  const [utangLog, setUtangLog] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH CLOUD DATA CORES ON INITIAL LOAD ---
  const fetchCloudData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch live product stocks
      const { data: prodData } = await supabase.from('products').select('*').order('name', { ascending: true });
      if (prodData) setProducts(prodData);

      // 2. Fetch sales logs records
      const { data: salesData } = await supabase.from('sales').select('*').order('id', { ascending: false });
      if (salesData) setSalesLog(salesData);

      // 3. Fetch outstanding utang logs
      const { data: utangData } = await supabase.from('utang').select('*').order('id', { ascending: false });
      if (utangData) setUtangLog(utangData);

    } catch (error) {
      console.error("Cloud connection failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCloudData();
  }, []);

  // Intermediary hook to force re-fetch cloud values when subtabs mutate tables
  const refreshProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('name', { ascending: true });
    if (data) setProducts(data);
  };

  const refreshSalesAndUtang = async () => {
    const { data: sData } = await supabase.from('sales').select('*').order('id', { ascending: false });
    if (sData) setSalesLog(sData);
    const { data: uData } = await supabase.from('utang').select('*').order('id', { ascending: false });
    if (uData) setUtangLog(uData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center font-sans">
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border text-center shadow-xl max-w-xs w-full animate-pulse">
          <span className="text-4xl block mb-2">⚡</span>
          <h2 className="text-md font-bold text-gray-700">Connecting to Store Cloud...</h2>
          <p className="text-xs text-gray-400 mt-1">Fetching live inventory levels</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* GLOBAL HEADER CONTROLS */}
      <header className="bg-blue-600 text-white p-4 flex flex-wrap justify-between items-center shadow-md">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🏪</span>
          <h1 className="text-lg font-black tracking-tight">Sari-Sari Cloud POS</h1>
        </div>
        <nav className="flex space-x-1 mt-2 sm:mt-0">
          <button onClick={() => { setActiveTab('cashier'); fetchCloudData(); }} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'cashier' ? 'bg-blue-800 shadow-sm' : 'hover:bg-blue-500'}`}>🛒 Cashier</button>
          <button onClick={() => { setActiveTab('inventory'); fetchCloudData(); }} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'inventory' ? 'bg-blue-800 shadow-sm' : 'hover:bg-blue-500'}`}>📦 Inventory</button>
          <button onClick={() => { setActiveTab('reports'); fetchCloudData(); }} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'reports' ? 'bg-blue-800 shadow-sm' : 'hover:bg-blue-500'}`}>📊 Reports</button>
          <button onClick={() => { setActiveTab('utang'); fetchCloudData(); }} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'utang' ? 'bg-blue-800 shadow-sm' : 'hover:bg-blue-500'}`}>📝 Utang ({utangLog.length})</button>
        </nav>
      </header>

      {/* CORE DISPLAY ROUTERS */}
      <main className="flex-1 p-4 max-w-7xl w-full mx-auto transition-all duration-300">
        {activeTab === 'cashier' && (
          <CashierTab 
            products={products} cart={cart} setCart={setCart} 
            salesLog={salesLog} setSalesLog={refreshSalesAndUtang} 
            utangLog={utangLog} setUtangLog={refreshSalesAndUtang} 
            searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
            cashReceived={cashReceived} setCashReceived={setCashReceived} 
            customerName={customerName} setCustomerName={setCustomerName} 
            isUtangTransaction={isUtangTransaction} setIsUtangTransaction={setIsUtangTransaction} 
          />
        )}
        {activeTab === 'inventory' && (
          <InventoryTab products={products} setProducts={refreshProducts} />
        )}
        {(activeTab === 'reports' || activeTab === 'utang') && (
          <ReportsAndUtangTab activeTab={activeTab} products={products} salesLog={salesLog} utangLog={utangLog} setUtangLog={refreshSalesAndUtang} />
        )}
      </main>
    </div>
  );
}
