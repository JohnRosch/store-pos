# 🏪 Sari-Sari Store Cloud POS System

A lightning-fast, modern, real-time Point of Sale (POS) system designed specifically for neighborhood retail businesses (Sari-Sari stores) in the Philippines. Built using **React + Vite**, styled with a premium **Glassmorphism UI layout**, and backed by a real-time **Supabase Cloud Database** for seamless data synchronization across multiple devices.

---

## ✨ Key Features

### 🛒 High-Velocity Cashier Canvas
* **Smart Catalog Shelf**: Interactive item grids with auto-dimming out-of-stock overlays and pulsating low-stock (`⚠️ REORDER`) alerts.
* **Peso Quick-Cash Buttons**: Touch-friendly shortcut buttons (+5, +10, +20, +50, +100, +500, +1000 PHP) to speed up transactions.
* **High-Contrast Sukli Indicator**: A large, bright amber-yellow display that calculates customer change instantly under any lighting condition.

### 📝 Integrated "Utang" Credit Tracker
* **Customer Balance Ledger**: Seamlessly log credit balances directly from the cashier drawer interface during checkout.
* **Instant Debt Settlements**: One-click settlement buttons that update balance sheets and sync across all logged-in devices in real time.

### 📦 Real-Time Cloud Inventory Manager
* **Live Warehouse Auditing**: Register new store products along with their capital cost, selling retail price, initial stock, and low-stock notification triggers.
* **Simplified Inventory Lifecycle**: Built-in cloud-restock multipliers and a secure, modal-confirmed permanent deletion handler.

### 📊 End-Of-Day (EOD) & Monthly Analytics
* **Smart Filter Selection Range**: Instantly isolate store performance metrics via dynamic time-range tabs (**Today**, **Yesterday**, **Past 7 Days**, **This Month**, or **All Time**).
* **Automated Data Auditing**: Monitor gross revenue velocity, net profit margins, and volume logs dynamically.
* **One-Click Backup Sheets**: Download comprehensive local spreadsheets (.CSV format) containing dynamic sales data matching selected time-ranges along with remaining stock assessments.

---

## 🛠️ Technology Stack & Architecture

* **Frontend Framework**: React 19 (via [Vite](https://vite.dev))
* **Database Backend**: [Supabase](https://supabase.com) (PostgreSQL Cloud Instances)
* **Design Language**: Tailwind CSS v4 (Modern Glassmorphism Design Pattern)
* **Network Handlers**: Native Fetch Architecture with customized multi-origin pre-flight listeners

---

## ⚙️ Local Installation & Deployment

Follow these quick configuration steps to boot up your own local network cluster instance:

### 1. Clone & Install Dependencies
Initialize your base packages inside your local machine's workspace terminal:
```bash
# Initialize node modules
npm install

# Install official backend database connectors
npm install @supabase/supabase-js
```

### 2. Configure Online Database Credentials
Create a file named `supabaseClient.js` inside your project's `src/` directory and structure your live API keys exactly like this:
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://YOUR_PROJECT_ID.supabase.co';
const supabaseAnonKey = 'YOUR_PUBLISHABLE_PUBLIC_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3. Initialize Cloud Storage Schemas
Execute this script inside the **SQL Editor** tab of your Supabase online space to instantiate your target workspace schemas automatically:
```sql
-- Create Products Ledger Table
create table products (
  id bigint generated always as identity primary key,
  name text not null,
  cost numeric not null,
  price numeric not null,
  stock integer not null,
  threshold integer default 5
);

-- Create Sales Transaction History Table
create table sales (
  id bigint generated always as identity primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  items text not null,
  total numeric not null,
  profit numeric not null,
  type text not null
);

-- Create Customer Credit Utang Table
create table utang (
  id bigint generated always as identity primary key,
  customer text not null,
  amount numeric not null,
  date date default current_date
);
```

### 4. Run Development Workspace
Fire up Vite's local dev engine to load up the interface components:
```bash
npm run dev
```
Open your browser tab to **`http://localhost:5173/`** to begin processing transactions!

---

## 🌐 Multi-Device Networking & Production Hosting

This system is completely ready for real-world deployment so that you can view your store data on multiple devices at once:

### Local Area Network (LAN) Syncing
1. Ensure both your computer and smartphone are connected to the same local Wi-Fi router.
2. In your computer terminal, look at the **`Network:`** address outputted by Vite (e.g., `http://192.168.1.X:5173/`).
3. Type that exact network IP address into your smartphone's web browser to instantly run your cashier on mobile while reviewing statistics on your main monitor!

### Cloud Deployment (Netlify)
1. Push your completed project code to a public or private repository on **GitHub**.
2. Log into **Netlify** and connect your account to your GitHub profile workspace.
3. Click **Import from Git**, select your `sarisari-pos` repository, and hit **Deploy Project**. Netlify will build and host your glassmorphism cloud dashboard live on the internet completely for free!

---

## 🔒 Security Notice
* This system operates using a localized client initialization bridge pattern. 
* To scale access securely for corporate networks or non-owner multi-staff shifts, row-level access tokens (RLS) can be turned on in Supabase alongside a secure login interface screen.
