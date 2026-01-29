import React, { useState, useEffect } from 'react';
import { Activity, Users, Package, Settings, Filter, RefreshCw, AlertCircle } from 'lucide-react';

const colorMap = {
  blue: "bg-blue-100 text-blue-600 ring-4 ring-blue-50",
  green: "bg-green-100 text-green-600 ring-4 ring-green-50",
  purple: "bg-purple-100 text-purple-600 ring-4 purple-50",
  orange: "bg-orange-100 text-orange-600 ring-4 ring-orange-50",
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [selectedEntity, setSelectedEntity] = useState({ type: 'all', id: null });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsRefreshing(true);
    try {
      // ✅ Safety fix for environment variables
      const apiUrl = (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) 
                     || 'https://factory-backendw.onrender.com/api/metrics';
      
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Backend not responding");
      
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      console.error("Data fetch failed", e);
      setError("System Offline: Check Backend Connection");
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Error state UI
  if (error && !data) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
       <AlertCircle size={48} className="text-red-500 mb-4 animate-bounce" />
       <h2 className="text-2xl font-bold text-slate-800">{error}</h2>
       <button onClick={fetchData} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">RETRY SYNC</button>
    </div>
  );

  // ✅ Loading state UI
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-medium text-slate-600 animate-pulse">Initializing Factory AI Analytics...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 text-slate-800 space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Factory <span className="text-blue-600">Vision</span> Monitor
          </h1>
          <p className="text-slate-500 font-medium">AI-Powered Worker Productivity Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200 text-xs font-bold text-slate-600">
            <span className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-blue-500 animate-ping' : 'bg-green-500'}`}></span>
            {isRefreshing ? 'SYNCING DATA...' : 'SYSTEM LIVE'}
          </div>
          <button onClick={fetchData} className="p-2 bg-white rounded-full border shadow-sm hover:bg-slate-50 transition">
            <RefreshCw size={18} className={`${isRefreshing ? 'animate-spin' : ''} text-slate-500`} />
          </button>
        </div>
      </div>

      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Total Units" value={data.factory.totalProduction} icon={<Package />} color="blue" subtitle="+12% from last hour" />
        <SummaryCard title="Avg Utilization" value={`${data.factory.avgUtilization}%`} icon={<Activity />} color="green" subtitle="Optimized Efficiency" />
        <SummaryCard title="Active Crew" value={data.factory.activeWorkers} icon={<Users />} color="purple" subtitle="Full Shift Deployment" />
        <SummaryCard title="Prod. Rate" value={`${(data.factory.totalProduction / 8).toFixed(1)} u/hr`} icon={<Settings />} color="orange" subtitle="Standard Velocity" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* WORKER TABLE SECTION */}
        <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold flex items-center gap-2">Worker Performance Analytics</h2>
            <button onClick={() => setSelectedEntity({ type: 'all', id: null })} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">
              RESET VIEW
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="p-4">Member</th>
                  <th className="p-4">Utilization</th>
                  <th className="p-4">Output</th>
                  <th className="p-4">UPH</th>
                  <th className="p-4 text-center">Focus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.workers.map((w) => (
                  <tr key={w.id} className={`hover:bg-slate-50/80 transition-all ${selectedEntity.id === w.id ? 'bg-blue-50/50' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                          {w.name.charAt(0)}
                        </div>
                        <span className="font-bold text-slate-700">{w.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                          <span>Efficiency</span>
                          <span>{w.utilization}%</span>
                        </div>
                        <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-700 ${w.utilization > 70 ? 'bg-blue-500' : w.utilization > 40 ? 'bg-orange-400' : 'bg-red-400'}`}
                            style={{ width: `${w.utilization}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-600">{w.units} <span className="text-[10px] font-normal text-slate-400">units</span></td>
                    <td className="p-4"><span className="px-2 py-1 bg-green-50 text-green-600 rounded-md font-bold text-xs">{w.uph}</span></td>
                    <td className="p-4 text-center">
                      <button onClick={() => setSelectedEntity({ type: 'worker', id: w.id })} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition">
                        <Filter size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* WORKSTATIONS GRID SECTION */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          <h2 className="text-lg font-bold">Workstation Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.stations.map(s => (
              <div
                key={s.station_id}
                onClick={() => setSelectedEntity({ type: 'station', id: s.station_id })}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer group ${
                  selectedEntity.id === s.station_id ? 'border-blue-500 bg-blue-50/20' : 'border-slate-50 bg-slate-50/30 hover:border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-slate-300 uppercase">{s.station_id}</span>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.status === 'working' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'working' ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                    {s.status.toUpperCase()}
                  </div>
                </div>
                <h3 className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{s.name}</h3>
                <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>THROUGHPUT</span>
                  <span className="text-slate-600">{s.units} UNITS</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* FOOTER ACTION BANNER */}
      {selectedEntity.id && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] md:w-auto p-4 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-8 animate-in slide-in-from-bottom-10">
          <div className="flex items-center gap-4 px-2">
            <div className="p-2 bg-blue-500 rounded-lg"><AlertCircle size={20}/></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Focused Analytics</p>
              <h3 className="text-sm font-bold">Investigating Entity: <span className="text-blue-400">{selectedEntity.id}</span></h3>
            </div>
          </div>
          <button onClick={() => setSelectedEntity({ type: 'all', id: null })} className="px-6 py-2 bg-white text-slate-900 rounded-xl font-bold text-xs hover:bg-slate-100 transition">
            RELEASE FILTER
          </button>
        </div>
      )}
    </div>
  );
};

const SummaryCard = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${colorMap[color]}`}>
      {React.cloneElement(icon, { size: 22 })}
    </div>
    <div className="space-y-1">
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
      <p className="text-3xl font-black text-slate-900">{value}</p>
      <p className="text-[10px] font-medium text-slate-400 pt-1">{subtitle}</p>
    </div>
  </div>
);

export default Dashboard;
