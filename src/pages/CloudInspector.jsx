import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import API_URL from '../config';
import { Terminal, RefreshCw, Database, Server, Code, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CloudInspector = () => {
    const { user } = useAuth();
    const [cloudData, setCloudData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [logs, setLogs] = useState([]);

    const addLog = (message) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev].slice(0, 10));
    };

    const fetchData = async () => {
        if (!user || !user.username) return;
        setLoading(true);
        addLog(`Initiating connection to MongoDB Atlas...`);

        try {
            // Artificial delay for "effect"
            await new Promise(r => setTimeout(r, 800));

            const res = await axios.get(`${API_URL}/api/progress/${user.username}`);
            if (res.data.success) {
                setCloudData(res.data.progress);
                setLastUpdated(new Date());
                addLog(`Data received from 104.196.xxx.xxx (MongoDB Replica Set)`);
                addLog(`Payload size: ${JSON.stringify(res.data.progress).length} bytes`);
            }
        } catch (error) {
            console.error("Inspector Error:", error);
            addLog(`CONNECTION ERROR: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-900 text-green-500 font-mono p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center border-b border-green-800 pb-4">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="p-2 hover:bg-green-900 rounded-full transition-colors text-green-400">
                            <ArrowLeft size={24} />
                        </Link>
                        <div className="p-3 bg-green-900 rounded-lg">
                            <Terminal size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-wider">CLOUD_INSPECTOR_V1.0</h1>
                            <p className="text-green-700 text-sm">Target: MongoDB Atlas Cluster0-shard-00-00</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className={`flex items-center gap-2 px-4 py-2 bg-green-900 hover:bg-green-800 rounded text-green-100 transition-all ${loading ? 'opacity-50' : ''}`}
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        RELOAD_DATA
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Panel: Status & Logs */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Status Card */}
                        <div className="bg-black/50 border border-green-800 p-4 rounded-lg">
                            <h2 className="text-green-400 font-bold mb-4 flex items-center gap-2">
                                <Server size={18} /> SYSTEM_STATUS
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-green-700">CONNECTION:</span>
                                    <span className="text-green-300">ESTABLISHED (Secure)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-green-700">PROTOCOL:</span>
                                    <span className="text-green-300">HTTPS/TLS 1.3</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-green-700">LATENCY:</span>
                                    <span className="text-green-300">~120ms</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-green-700">USER_ID:</span>
                                    <span className="text-green-300">{user?.username}</span>
                                </div>
                            </div>
                        </div>

                        {/* Terminal Logs */}
                        <div className="bg-black border border-green-800 p-4 rounded-lg h-64 overflow-hidden flex flex-col">
                            <h2 className="text-green-400 font-bold mb-2 flex items-center gap-2 border-b border-green-900 pb-2">
                                <Code size={18} /> CONSOLE_OUTPUT
                            </h2>
                            <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1 text-green-300/80 scrollbar-thin scrollbar-thumb-green-900">
                                {logs.map((log, i) => (
                                    <div key={i}>{log}</div>
                                ))}
                                <div className="animate-pulse">_</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Data Visualization */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-900 border border-green-800 rounded-lg overflow-hidden h-full flex flex-col">
                            <div className="bg-gray-800 px-4 py-2 border-b border-green-800 flex justify-between items-center">
                                <div className="flex items-center gap-2 text-green-400">
                                    <Database size={16} />
                                    <span className="text-sm font-bold">RAW_JSON_DATA</span>
                                </div>
                                <span className="text-xs text-green-600">
                                    {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Waiting for data...'}
                                </span>
                            </div>

                            <div className="p-4 overflow-auto flex-1 bg-black/80">
                                {loading && !cloudData ? (
                                    <div className="flex items-center justify-center h-full text-green-700 animate-pulse">
                                        DOWNLOADING_PACKETS...
                                    </div>
                                ) : (
                                    <pre className="text-xs md:text-sm text-green-300 font-mono whitespace-pre-wrap break-all">
                                        {cloudData ? JSON.stringify(cloudData, null, 2) : '// NO_DATA_FOUND'}
                                    </pre>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default CloudInspector;
