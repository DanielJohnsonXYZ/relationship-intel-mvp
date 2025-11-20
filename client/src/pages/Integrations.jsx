import React from 'react';
import { Mail, Slack, Check, AlertCircle } from 'lucide-react';

const Integrations = () => {
    const handleConnect = (platform) => {
        window.location.href = `http://localhost:3000/auth/${platform}`;
    };

    // Check URL params for connection success (mock)
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('connected');

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Integrations</h1>
            <p className="text-gray-400 mb-8">Connect your communication channels to start analyzing relationships.</p>

            <div className="grid gap-6">
                {/* Gmail */}
                <div className="bg-card border border-white/5 rounded-xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                            <Mail size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Gmail</h3>
                            <p className="text-gray-400 text-sm">Analyze emails for sentiment and risks.</p>
                        </div>
                    </div>
                    {connected === 'gmail' ? (
                        <button disabled className="bg-success/10 text-success px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                            <Check size={18} /> Connected
                        </button>
                    ) : (
                        <button
                            onClick={() => handleConnect('google')}
                            className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Connect Gmail
                        </button>
                    )}
                </div>

                {/* Slack */}
                <div className="bg-card border border-white/5 rounded-xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-lg">
                            <Slack size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Slack</h3>
                            <p className="text-gray-400 text-sm">Monitor channels and DMs for key signals.</p>
                        </div>
                    </div>
                    {connected === 'slack' ? (
                        <button disabled className="bg-success/10 text-success px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                            <Check size={18} /> Connected
                        </button>
                    ) : (
                        <button
                            onClick={() => handleConnect('slack')}
                            className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Connect Slack
                        </button>
                    )}
                </div>
            </div>

            <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={20} />
                <div>
                    <h4 className="font-medium text-blue-400 mb-1">Privacy First</h4>
                    <p className="text-sm text-blue-300/80">
                        We only analyze text content. Your data is encrypted and never used to train public models.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Integrations;
