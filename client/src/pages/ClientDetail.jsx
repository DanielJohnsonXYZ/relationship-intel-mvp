import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getClient, getClientMessages } from '../api';
import { ArrowLeft, MessageSquare, AlertTriangle, TrendingUp, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

const ClientDetail = () => {
    const { id } = useParams();
    const [client, setClient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientData, messagesData] = await Promise.all([
                    getClient(id),
                    getClientMessages(id)
                ]);
                setClient(clientData);
                setMessages(messagesData);
            } catch (error) {
                console.error("Failed to fetch client data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!client) return <div className="p-8 text-center">Client not found</div>;

    const getStatusColor = (status) => {
        switch (status) {
            case 'risk': return 'text-risk bg-risk/10 border-risk/20';
            case 'opportunity': return 'text-secondary bg-secondary/10 border-secondary/20';
            case 'healthy': return 'text-success bg-success/10 border-success/20';
            default: return 'text-gray-400 bg-gray-800/50 border-gray-700';
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft size={18} /> Back to Dashboard
            </Link>

            <header className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{client.name}</h1>
                    <div className="flex items-center gap-3 text-gray-400">
                        <span>{client.company}</span>
                        <span>•</span>
                        <span>Last Contact: {new Date(client.last_contact_date).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className={clsx('px-4 py-2 rounded-lg border font-medium capitalize', getStatusColor(client.status))}>
                    {client.status}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Conversation History */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <MessageSquare size={20} />
                        Conversation History
                    </h2>
                    <div className="space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-gray-500 text-center py-8 bg-card border border-white/5 rounded-xl">
                                No messages recorded yet.
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className="bg-card border border-white/5 rounded-xl p-5">
                                    <div className="flex justify-between items-center mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-white/10 px-2 py-1 rounded text-xs uppercase font-bold text-gray-400">
                                                {msg.platform}
                                            </span>
                                            <span className="text-sm text-gray-400">
                                                {new Date(msg.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-200 whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Stats / Metadata */}
                <div className="space-y-6">
                    <div className="bg-card border border-white/5 rounded-xl p-6">
                        <h3 className="font-semibold mb-4 text-gray-300">Relationship Stats</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Sentiment Score</div>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-risk via-yellow-500 to-success"
                                            style={{ width: `${client.sentiment_score * 100}%` }}
                                        />
                                    </div>
                                    <span className="font-mono font-bold">{(client.sentiment_score * 100).toFixed(0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDetail;
