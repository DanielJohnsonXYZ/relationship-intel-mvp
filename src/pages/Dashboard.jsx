import React, { useEffect, useState } from 'react';
import { getClients, getInsights, analyzeText } from '../api';
import { AlertTriangle, CheckCircle, TrendingUp, Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [clients, setClients] = useState([]);
    const [insights, setInsights] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedClient, setSelectedClient] = useState(1); // Default to first client

    const fetchData = async () => {
        const [clientsData, insightsData] = await Promise.all([getClients(), getInsights()]);
        setClients(clientsData);
        setInsights(insightsData);
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    const handleAnalyze = async () => {
        if (!inputText.trim()) return;
        setIsAnalyzing(true);
        try {
            await analyzeText(inputText, selectedClient, 'manual');
            setInputText('');
            fetchData(); // Refresh immediately
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'risk': return 'text-risk bg-risk/10 border-risk/20';
            case 'opportunity': return 'text-secondary bg-secondary/10 border-secondary/20';
            case 'healthy': return 'text-success bg-success/10 border-success/20';
            default: return 'text-gray-400 bg-gray-800/50 border-gray-700';
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'risk': return <AlertTriangle size={18} />;
            case 'opportunity': return <TrendingUp size={18} />;
            default: return <CheckCircle size={18} />;
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Good Morning, Alex</h1>
                    <p className="text-gray-400">Here's what's happening with your relationships today.</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-card border border-white/5 px-4 py-2 rounded-lg text-center">
                        <div className="text-sm text-gray-400">Retention</div>
                        <div className="font-bold text-xl text-success">94%</div>
                    </div>
                    <div className="bg-card border border-white/5 px-4 py-2 rounded-lg text-center">
                        <div className="text-sm text-gray-400">Opportunities</div>
                        <div className="font-bold text-xl text-secondary">3</div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Client Health */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Input Area */}
                    <section className="bg-card border border-white/5 rounded-2xl p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Send size={20} className="text-primary" />
                            Analyze New Conversation
                        </h2>
                        <div className="flex flex-col gap-4">
                            <select
                                className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
                                value={selectedClient}
                                onChange={(e) => setSelectedClient(Number(e.target.value))}
                            >
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                            <textarea
                                className="bg-black/20 border border-white/10 rounded-xl p-4 min-h-[120px] focus:outline-none focus:border-primary transition-colors resize-none"
                                placeholder="Paste an email, Slack message, or call transcript here..."
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing || !inputText}
                                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                    Analyze
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Recent Insights Feed */}
                    <section>
                        <h2 className="text-lg font-semibold mb-4">Recent Insights</h2>
                        <div className="space-y-4">
                            {insights.map((insight) => (
                                <motion.div
                                    key={insight.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-card border border-white/5 rounded-xl p-5 hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className={clsx('p-2 rounded-lg', getStatusColor(insight.type))}>
                                                {getIcon(insight.type)}
                                            </span>
                                            <div>
                                                <div className="font-medium">{insight.client_name}</div>
                                                <div className="text-xs text-gray-500">{new Date(insight.timestamp).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div className="text-sm font-mono text-gray-500">
                                            {(insight.confidence * 100).toFixed(0)}% Conf.
                                        </div>
                                    </div>
                                    <p className="text-gray-300 mb-3">{insight.summary}</p>
                                    {insight.action_item && (
                                        <div className="bg-white/5 rounded-lg px-3 py-2 text-sm flex items-center gap-2 text-primary/80">
                                            <span className="uppercase text-[10px] font-bold tracking-wider opacity-70">Action</span>
                                            {insight.action_item}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Client List */}
                <div className="space-y-6">
                    <section className="bg-card border border-white/5 rounded-2xl p-6 h-full">
                        <h2 className="text-lg font-semibold mb-4">Client Health</h2>
                        <div className="space-y-3">
                            {clients.map((client) => (
                                <Link to={`/clients/${client.id}`} key={client.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className={clsx('w-2 h-2 rounded-full',
                                            client.status === 'risk' ? 'bg-risk' :
                                                client.status === 'opportunity' ? 'bg-secondary' : 'bg-success'
                                        )} />
                                        <div>
                                            <div className="font-medium group-hover:text-primary transition-colors">{client.name}</div>
                                            <div className="text-xs text-gray-500">{client.company}</div>
                                        </div>
                                    </div>
                                    <div className={clsx('text-xs px-2 py-1 rounded border', getStatusColor(client.status))}>
                                        {client.status}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
