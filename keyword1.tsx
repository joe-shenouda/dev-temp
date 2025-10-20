import React, { useState } from 'react';

interface KeywordResult {
  nameKeywords: string[];
  domainKeywords: string[];
  totalCount: number;
}

interface StepStatus {
  step1: 'pending' | 'loading' | 'success' | 'error';
  step2: 'pending' | 'loading' | 'success' | 'error';
  step3: 'pending' | 'loading' | 'success' | 'error';
}

export default function KeywordDiscovery() {
  const [domain, setDomain] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [stepStatus, setStepStatus] = useState<StepStatus>({
    step1: 'pending',
    step2: 'pending',
    step3: 'pending'
  });
  const [results, setResults] = useState<KeywordResult | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const performWhoisLookup = async (domainName: string): Promise<string | null> => {
    setStepStatus(prev => ({ ...prev, step1: 'loading' }));
    addLog(`[*] [Step 1] Performing WHOIS lookup for ${domainName}...`);
    await simulateDelay(1500);

    // Simulate WHOIS lookup - in reality, this requires a backend proxy
    // due to CORS and protocol restrictions
    const mockOrgs = ['Example Corporation', 'Tech Solutions Inc.', 'Digital Services LLC'];
    const randomOrg = mockOrgs[Math.floor(Math.random() * mockOrgs.length)];
    
    addLog(`[+] Found Organization: ${randomOrg}`);
    addLog('');
    setStepStatus(prev => ({ ...prev, step1: 'success' }));
    return randomOrg;
  };

  const queryCTLogsByDomain = async (domainName: string): Promise<string[]> => {
    setStepStatus(prev => ({ ...prev, step2: 'loading' }));
    addLog(`[*] [Step 2] Querying CT Logs for subdomains of '${domainName}'...`);
    await simulateDelay(2000);

    // Try to query crt.sh - note: this will likely fail due to CORS
    try {
      const response = await fetch(`https://crt.sh/?q=%.${domainName}&output=json`, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        const domains = new Set<string>();
        data.forEach((entry: any) => {
          const names = entry.name_value?.split('\n') || [];
          names.forEach((name: string) => {
            if (name && !name.startsWith('*')) {
              domains.add(name.trim());
            }
          });
        });
        const result = Array.from(domains);
        addLog(`[+] Found ${result.length} domain-related keywords.`);
        setStepStatus(prev => ({ ...prev, step2: 'success' }));
        return result;
      }
    } catch (error) {
      // CORS error expected - use mock data
    }

    // Mock data for demonstration
    const mockSubdomains = [
      domainName,
      `www.${domainName}`,
      `mail.${domainName}`,
      `api.${domainName}`,
      `dev.${domainName}`,
      `staging.${domainName}`,
      `admin.${domainName}`
    ];
    addLog(`[+] Found ${mockSubdomains.length} domain-related keywords.`);
    addLog('[i] Note: Using sample data due to CORS restrictions.');
    setStepStatus(prev => ({ ...prev, step2: 'success' }));
    return mockSubdomains;
  };

  const queryCTLogsByOrg = async (org: string, domainName: string): Promise<string[]> => {
    setStepStatus(prev => ({ ...prev, step3: 'loading' }));
    addLog('');
    addLog(`[*] [Step 3] Querying CT Logs for Organization '${org}'...`);
    await simulateDelay(2000);

    // Mock sister domains
    const baseDomain = domainName.split('.')[0];
    const mockSisterDomains = [
      `${baseDomain}-corp.com`,
      `${baseDomain}global.net`,
      `${baseDomain}services.com`,
      `my${baseDomain}.com`
    ];
    
    addLog(`[+] Found ${mockSisterDomains.length} organization-related keywords (sister domains).`);
    addLog('[i] Note: Using sample data due to CORS restrictions.');
    setStepStatus(prev => ({ ...prev, step3: 'success' }));
    return mockSisterDomains;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;

    setIsProcessing(true);
    setLogs([]);
    setResults(null);
    setOrganizationName(null);
    setStepStatus({ step1: 'pending', step2: 'pending', step3: 'pending' });

    addLog(`--- Starting Keyword Discovery for: ${domain} ---`);
    addLog('');

    try {
      const allKeywords = new Set<string>();
      allKeywords.add(domain);

      // Step 1: WHOIS
      const org = await performWhoisLookup(domain);
      if (org) {
        setOrganizationName(org);
        allKeywords.add(org);
      }

      // Step 2: CT Logs by Domain
      const domainKeywords = await queryCTLogsByDomain(domain);
      domainKeywords.forEach(k => allKeywords.add(k));

      // Step 3: CT Logs by Organization
      let orgKeywords: string[] = [];
      if (org) {
        orgKeywords = await queryCTLogsByOrg(org, domain);
        orgKeywords.forEach(k => allKeywords.add(k));
      }

      // Process results
      const allKeywordsArray = Array.from(allKeywords);
      const nameKeywords = allKeywordsArray.filter(k => !k.includes('.')).sort();
      const domainKeywordsFinal = allKeywordsArray.filter(k => k.includes('.')).sort();

      addLog('');
      addLog('='.repeat(50));
      addLog('  All Discovered Keywords (Deduplicated)');
      addLog('='.repeat(50));

      setResults({
        nameKeywords,
        domainKeywords: domainKeywordsFinal,
        totalCount: allKeywordsArray.length
      });
    } catch (error) {
      addLog(`[!] Error during discovery: ${error}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStepIcon = (status: 'pending' | 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading': return '⏳';
      case 'success': return '✓';
      case 'error': return '✗';
      default: return '○';
    }
  };

  const getStepColor = (status: 'pending' | 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Automated Keyword Discovery
          </h1>
          <p className="text-gray-400 text-lg">Domain reconnaissance through WHOIS and Certificate Transparency</p>
        </div>

        {/* Info Card */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="text-blue-400 mr-2">ℹ️</span>
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="font-semibold text-blue-400 mb-2">1. WHOIS Lookup</div>
              <div className="text-gray-400">Finds the legal registrant organization name</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="font-semibold text-purple-400 mb-2">2. CT Log (Domain)</div>
              <div className="text-gray-400">Queries for all subdomains via Certificate Transparency</div>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="font-semibold text-pink-400 mb-2">3. CT Log (Org)</div>
              <div className="text-gray-400">Finds sister domains registered to same organization</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Input and Process */}
          <div className="space-y-6">
            {/* Input Form */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Enter Target Domain</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                    disabled={isProcessing}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isProcessing || !domain.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {isProcessing ? 'Processing...' : 'Start Discovery'}
                </button>
              </form>
            </div>

            {/* Process Steps */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Discovery Process</h2>
              <div className="space-y-3">
                <div className={`flex items-center p-3 rounded-lg bg-gray-900 ${getStepColor(stepStatus.step1)}`}>
                  <span className="text-2xl mr-3">{getStepIcon(stepStatus.step1)}</span>
                  <div>
                    <div className="font-semibold">Step 1: WHOIS Lookup</div>
                    <div className="text-sm text-gray-400">Finding organization name</div>
                  </div>
                </div>
                <div className={`flex items-center p-3 rounded-lg bg-gray-900 ${getStepColor(stepStatus.step2)}`}>
                  <span className="text-2xl mr-3">{getStepIcon(stepStatus.step2)}</span>
                  <div>
                    <div className="font-semibold">Step 2: CT Log (Domain)</div>
                    <div className="text-sm text-gray-400">Querying subdomains</div>
                  </div>
                </div>
                <div className={`flex items-center p-3 rounded-lg bg-gray-900 ${getStepColor(stepStatus.step3)}`}>
                  <span className="text-2xl mr-3">{getStepIcon(stepStatus.step3)}</span>
                  <div>
                    <div className="font-semibold">Step 3: CT Log (Organization)</div>
                    <div className="text-sm text-gray-400">Finding sister domains</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Limitations */}
            <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-4">
              <div className="flex items-start">
                <span className="text-yellow-500 text-xl mr-3 mt-1">⚠️</span>
                <div className="text-sm">
                  <div className="font-semibold text-yellow-400 mb-1">Browser Limitations</div>
                  <div className="text-gray-300">Due to CORS restrictions, this demo uses simulated data. A production version would require a backend proxy for WHOIS and CT log queries.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Logs and Results */}
          <div className="space-y-6">
            {/* Terminal Logs */}
            {logs.length > 0 && (
              <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center">
                  <div className="flex space-x-2 mr-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-sm text-gray-400 font-mono">console.log</span>
                </div>
                <div className="p-4 h-96 overflow-y-auto font-mono text-sm">
                  {logs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`mb-1 ${
                        log.startsWith('[+]') ? 'text-green-400' :
                        log.startsWith('[*]') ? 'text-blue-400' :
                        log.startsWith('[!]') ? 'text-red-400' :
                        log.startsWith('[i]') ? 'text-yellow-400' :
                        log.includes('=') ? 'text-purple-400' :
                        'text-gray-300'
                      }`}
                    >
                      {log || '\u00A0'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {results && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
                  <span>Discovered Keywords</span>
                  <span className="text-sm bg-blue-600 px-3 py-1 rounded-full">
                    {results.totalCount} Total
                  </span>
                </h2>

                {/* Organization Names */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">
                    Organization Names ({results.nameKeywords.length})
                  </h3>
                  {results.nameKeywords.length > 0 ? (
                    <div className="space-y-2">
                      {results.nameKeywords.map((name, idx) => (
                        <div key={idx} className="bg-gray-900 px-4 py-2 rounded-lg font-mono text-sm">
                          {name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">No organization names found</div>
                  )}
                </div>

                {/* Domains */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">
                    Domains & Subdomains ({results.domainKeywords.length})
                  </h3>
                  {results.domainKeywords.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
                      {results.domainKeywords.map((domain, idx) => (
                        <div key={idx} className="bg-gray-900 px-4 py-2 rounded-lg font-mono text-sm">
                          {domain}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">No domain keywords found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
