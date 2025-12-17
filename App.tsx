
import React, { useState, useCallback } from 'react';
import { IikoService } from './services/iikoApi';
import { ApiLog, Organization } from './types';
import { JsonViewer } from './components/JsonViewer';
import { 
  KeyIcon, 
  BuildingOfficeIcon, 
  ComputerDesktopIcon, 
  BookOpenIcon,
  TrashIcon,
  ClockIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [apiLogin, setApiLogin] = useState('');
  const [token, setToken] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [activeLogId, setActiveLogId] = useState<string | null>(null);

  const addLog = (method: string, url: string, status: number, requestBody: any, responseBody: any, duration: number) => {
    const newLog: ApiLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      method,
      url,
      status,
      requestBody,
      responseBody,
      duration,
    };
    setLogs(prev => [newLog, ...prev].slice(0, 20));
    setActiveLogId(newLog.id);
  };

  const handleAuth = async () => {
    if (!apiLogin) return;
    setLoading('auth');
    const res = await IikoService.getAccessToken(apiLogin);
    addLog('POST', res.url, res.status, { apiLogin }, res.data, res.duration);
    if (res.status === 200 && res.data.token) {
      setToken(res.data.token);
    }
    setLoading(null);
  };

  const fetchOrganizations = async () => {
    if (!token) return;
    setLoading('orgs');
    const res = await IikoService.getOrganizations(token);
    addLog('GET', res.url, res.status, null, res.data, res.duration);
    if (res.status === 200 && res.data.organizations) {
      setOrganizations(res.data.organizations);
      if (res.data.organizations.length > 0) {
        setSelectedOrgId(res.data.organizations[0].id);
      }
    }
    setLoading(null);
  };

  const fetchTerminalGroups = async () => {
    if (!token || !selectedOrgId) return;
    setLoading('terminals');
    const res = await IikoService.getTerminalGroups(token, [selectedOrgId]);
    addLog('POST', res.url, res.status, { organizationIds: [selectedOrgId] }, res.data, res.duration);
    setLoading(null);
  };

  const fetchMenu = async () => {
    if (!token || !selectedOrgId) return;
    setLoading('menu');
    const res = await IikoService.getNomenclature(token, selectedOrgId);
    addLog('POST', res.url, res.status, { organizationId: selectedOrgId }, res.data, res.duration);
    setLoading(null);
  };

  const clearLogs = () => {
    setLogs([]);
    setActiveLogId(null);
  };

  const activeLog = logs.find(l => l.id === activeLogId);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <KeyIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">iiko <span className="text-indigo-400">Checker</span></h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${token ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/50' : 'bg-rose-900/30 text-rose-400 border border-rose-500/50'}`}>
            {token ? (
              <><CheckCircleIcon className="w-4 h-4 mr-1.5" /> Authenticated</>
            ) : (
              <><ExclamationCircleIcon className="w-4 h-4 mr-1.5" /> Unauthorized</>
            )}
          </span>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden h-[calc(100vh-73px)]">
        {/* Sidebar Controls */}
        <div className="lg:col-span-4 bg-slate-900 border-r border-slate-800 p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-8">
            {/* Auth Section */}
            <section>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                <KeyIcon className="w-4 h-4 mr-2" /> Authentication
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5 ml-1">API Login (iikoCloud)</label>
                  <input
                    type="text"
                    value={apiLogin}
                    onChange={(e) => setApiLogin(e.target.value)}
                    placeholder="Enter your apiLogin..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-700"
                  />
                </div>
                <button
                  onClick={handleAuth}
                  disabled={loading === 'auth' || !apiLogin}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center"
                >
                  {loading === 'auth' ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Get Access Token'}
                </button>
              </div>
            </section>

            {/* Step-by-Step Actions */}
            <section className={!token ? 'opacity-40 pointer-events-none grayscale' : ''}>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
                <ChevronRightIcon className="w-4 h-4 mr-2" /> API Operations
              </h2>
              <div className="space-y-3">
                <button
                  onClick={fetchOrganizations}
                  disabled={loading !== null}
                  className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 p-4 rounded-xl border border-slate-700 transition-all group"
                >
                  <div className="flex items-center text-left">
                    <div className="bg-amber-900/30 p-2 rounded-lg mr-4 group-hover:bg-amber-800/50 transition-colors">
                      <BuildingOfficeIcon className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Organizations</p>
                      <p className="text-xs text-slate-500">List all connected units</p>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />
                </button>

                {organizations.length > 0 && (
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <label className="block text-xs text-slate-500 mb-2">Select Organization</label>
                    <select
                      value={selectedOrgId}
                      onChange={(e) => setSelectedOrgId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none"
                    >
                      {organizations.map(org => (
                        <option key={org.id} value={org.id}>{org.name}</p>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  onClick={fetchTerminalGroups}
                  disabled={loading !== null || !selectedOrgId}
                  className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 p-4 rounded-xl border border-slate-700 transition-all group"
                >
                  <div className="flex items-center text-left">
                    <div className="bg-sky-900/30 p-2 rounded-lg mr-4 group-hover:bg-sky-800/50 transition-colors">
                      <ComputerDesktopIcon className="w-5 h-5 text-sky-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Terminal Groups</p>
                      <p className="text-xs text-slate-500">View terminals & groups</p>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />
                </button>

                <button
                  onClick={fetchMenu}
                  disabled={loading !== null || !selectedOrgId}
                  className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 p-4 rounded-xl border border-slate-700 transition-all group"
                >
                  <div className="flex items-center text-left">
                    <div className="bg-emerald-900/30 p-2 rounded-lg mr-4 group-hover:bg-emerald-800/50 transition-colors">
                      <BookOpenIcon className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Nomenclature</p>
                      <p className="text-xs text-slate-500">Fetch full menu & items</p>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* Results and Logs */}
        <div className="lg:col-span-8 flex flex-col h-full bg-slate-950/50">
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {activeLog ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold flex items-center">
                      <span className={`px-2 py-0.5 rounded text-xs mr-3 font-mono ${activeLog.status >= 400 ? 'bg-rose-900/40 text-rose-400' : 'bg-emerald-900/40 text-emerald-400'}`}>
                        {activeLog.status}
                      </span>
                      {activeLog.method} Request
                    </h3>
                    <p className="text-slate-500 text-sm mt-1 break-all font-mono">{activeLog.url}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-slate-400 text-xs flex items-center">
                      <ClockIcon className="w-3.5 h-3.5 mr-1" /> {activeLog.duration}ms
                    </span>
                    <span className="text-slate-600 text-[10px] mt-1 uppercase tracking-widest">{activeLog.timestamp}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {activeLog.requestBody && (
                    <JsonViewer title="Request Body" data={activeLog.requestBody} />
                  )}
                  <JsonViewer title="Response Body" data={activeLog.responseBody} />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600">
                <div className="bg-slate-900/50 p-6 rounded-full mb-6">
                  <ComputerDesktopIcon className="w-16 h-16 text-slate-800" />
                </div>
                <h3 className="text-lg font-medium text-slate-400">Ready to test?</h3>
                <p className="max-w-xs text-center mt-2 text-sm leading-relaxed">
                  Enter your API login on the left and start making requests. The JSON response will appear here.
                </p>
              </div>
            )}
          </div>

          {/* Activity Log (History) */}
          <div className="h-1/3 bg-slate-900 border-t border-slate-800 flex flex-col">
            <div className="px-6 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                <ClockIcon className="w-4 h-4 mr-2" /> Recent Activity
              </h4>
              {logs.length > 0 && (
                <button 
                  onClick={clearLogs}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded-md transition-colors"
                  title="Clear Logs"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-700 text-xs italic">
                  No requests made yet.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-separate border-spacing-0">
                  <thead className="sticky top-0 bg-slate-900 shadow-sm z-10">
                    <tr className="text-slate-500">
                      <th className="px-6 py-2 font-medium border-b border-slate-800">Method</th>
                      <th className="px-6 py-2 font-medium border-b border-slate-800">Status</th>
                      <th className="px-6 py-2 font-medium border-b border-slate-800">Path</th>
                      <th className="px-6 py-2 font-medium border-b border-slate-800">Time</th>
                      <th className="px-6 py-2 font-medium border-b border-slate-800 text-right">Dur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr 
                        key={log.id} 
                        onClick={() => setActiveLogId(log.id)}
                        className={`cursor-pointer hover:bg-indigo-600/10 transition-colors ${activeLogId === log.id ? 'bg-indigo-600/5' : ''}`}
                      >
                        <td className="px-6 py-3 border-b border-slate-800/50 font-bold text-slate-300">{log.method}</td>
                        <td className="px-6 py-3 border-b border-slate-800/50">
                          <span className={`font-mono ${log.status >= 400 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 border-b border-slate-800/50 text-slate-400 truncate max-w-[200px] font-mono">
                          {log.url.split('api/1')[1]}
                        </td>
                        <td className="px-6 py-3 border-b border-slate-800/50 text-slate-500">{log.timestamp}</td>
                        <td className="px-6 py-3 border-b border-slate-800/50 text-right text-slate-600">{log.duration}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Disclaimer */}
      <div className="lg:hidden fixed inset-0 bg-slate-900 z-[100] flex items-center justify-center p-8 text-center">
        <div>
          <ExclamationCircleIcon className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Desktop Recommended</h2>
          <p className="text-slate-400 text-sm">This developer tool is optimized for larger screens to properly view JSON responses and logs.</p>
        </div>
      </div>
    </div>
  );
};

export default App;
