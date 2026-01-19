import React, { useState, useEffect } from 'react';
import reportApi from '../../../services/reportApi';

const MetabaseDashboard = () => {
    const [iframeUrl, setIframeUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUrl = async () => {
            try {
                const response = await reportApi.getMetabaseDashboardUrl();
                if (response.success && response.data.iframeUrl) {
                    setIframeUrl(response.data.iframeUrl);
                } else {
                    setError('Failed to load dashboard configuration');
                }
            } catch (err) {
                console.error("Metabase Error:", err);
                setError(err.response?.data?.message || 'Failed to connect to Analytics Server');
            } finally {
                setLoading(false);
            }
        };

        fetchUrl();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h2 className="text-xl font-semibold mb-2">Analytics Dashboard Unavailable</h2>
                <p className="text-muted-foreground mb-4 max-w-md">{error}</p>
                <div className="bg-gray-100 p-4 rounded-md text-left text-sm font-mono text-gray-700">
                    <p className="font-bold mb-2">Setup Required:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Go to Metabase Admin - Embedding</li>
                        <li>Enable "Embedding in other applications"</li>
                        <li>Add these to backend .env file:
                            <div className="mt-2 p-2 bg-gray-200 rounded select-all">
                                METABASE_SITE_URL=http://localhost:3000<br />
                                METABASE_SECRET_KEY=your_secret_key<br />
                                METABASE_DASHBOARD_ID=1
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-[calc(100vh-64px)] bg-gray-50 flex flex-col">
            <div className="px-6 py-4 bg-white border-b flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Operational Analytics</h1>
                <a
                    href={iframeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                >
                    Open in Metabase ↗
                </a>
            </div>
            <div className="flex-1 w-full bg-white relative">
                <iframe
                    src={iframeUrl}
                    frameBorder="0" // Deprecated but widely supported reset
                    width="100%"
                    height="100%"
                    allowTransparency
                    className="absolute inset-0 w-full h-full"
                    title="Metabase Analytics"
                />
            </div>
        </div>
    );
};

export default MetabaseDashboard;
