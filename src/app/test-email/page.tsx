'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TestEmailPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{success?: boolean; message?: string; error?: string} | null>(null);

  const testEmail = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to test email' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          🧪 Email Test
        </h1>
        
        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            Test your Gmail email configuration
          </p>
          
          <button
            onClick={testEmail}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Send Test Email'}
          </button>
          
          {result && (
            <div className={`p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <h3 className="font-semibold mb-2">
                {result.success ? '✅ Success!' : '❌ Error'}
              </h3>
              <p className="text-sm">{result.message || result.error}</p>
              {result.details && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">Details</summary>
                  <pre className="text-xs mt-2 overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
          
          <div className="text-sm text-gray-500 space-y-2">
            <p><strong>To set up email:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Enable 2FA on your Gmail account</li>
              <li>Generate an App Password</li>
              <li>Add GMAIL_USER and GMAIL_APP_PASSWORD to .env.local</li>
              <li>Restart the development server</li>
            </ol>
          </div>
          
          <div className="text-center">
            <Link 
              href="/" 
              className="text-green-600 hover:text-green-700 underline"
            >
              ← Back to Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
