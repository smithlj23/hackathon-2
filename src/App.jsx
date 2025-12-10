import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Activity, TrendingUp } from 'lucide-react';

const SantaSOC = () => {
  const [incidents, setIncidents] = useState([]);
  const [analyzedIncidents, setAnalyzedIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [showNaughtyNiceList, setShowNaughtyNiceList] = useState(false);

  // Generate random incident data
  const generateIncidents = () => {
    const users = [
      'Elf_Buddy', 'Elf_Jingle', 'Elf_Sparkle', 'Rudolph', 'Dasher', 'Prancer',
      'Mrs_Claus', 'Elf_Tinsel', 'Blitzen', 'Comet', 'Elf_Cookie'
    ];
    
    const events = [
      // Naughty incidents
      'Accessed toy production database after hours',
      'Multiple failed login attempts to Nice List portal',
      'Downloaded entire Naughty List to external sleigh drive',
      'Attempted to modify gift delivery routes',
      'Suspicious cookie consumption detected in server room',
      'Unauthorized access to reindeer flight plans',
      'Candy cane smuggling detected at North Pole perimeter',
      'Malicious gingerbread executable found in mailroom',
      'Elf attempted to escalate privileges to "Head Elf"',
      'Unusual network traffic to Grinch Mountain IP',
      'Sleigh GPS coordinates leaked on dark web',
      'Phishing email: "Click here for extra milk and cookies"',
      'Ransomware threat: Pay 1000 candy canes or no presents',
      'Workshop camera footage mysteriously deleted',
      'Toy prototype stolen from R&D department',
      'Elf tried to install unauthorized Christmas music streaming app',
      'Reindeer stable door left unlocked overnight',
      'Present wrapping paper inventory discrepancy detected',
      'SQL injection attempt on gift wishlist database',
      'Distributed Denial of Sleigh (DDoS) attack detected',
      // Nice incidents
      'Reported security vulnerability in gift tracking system',
      'Completed mandatory cybersecurity training early',
      'Helped another elf reset forgotten password securely',
      'Identified and blocked phishing email targeting workshop',
      'Properly logged out of all systems before sleigh ride',
      'Updated antivirus on toy testing equipment',
      'Organized workshop security awareness meeting',
      'Implemented two-factor authentication on personal account',
      'Safely disposed of sensitive Nice List documents',
      'Backed up critical toy design files to secure location',
      'Reported suspicious activity near server room',
      'Volunteered for after-hours security patrol',
      'Created strong passwords for all workshop accounts',
      'Patched security vulnerabilities in gift wrapping software',
      'Mentored junior elf on security best practices',
      'Encrypted sensitive communications with Santa',
      'Conducted security audit of reindeer stable access controls',
      'Properly segregated production and test environments',
      'Implemented logging for gift delivery API',
      'Documented incident response procedures for workshop'
    ];

    const newIncidents = [];
    const count = Math.floor(Math.random() * 3) + 3; // 3-5 incidents
    
    for (let i = 0; i < count; i++) {
      const timestamp = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
      newIncidents.push({
        id: `INC-${Date.now()}-${i}`,
        user: users[Math.floor(Math.random() * users.length)],
        event: events[Math.floor(Math.random() * events.length)],
        timestamp: timestamp.toISOString(),
        analyzed: false
      });
    }
    
    setIncidents(prev => [...newIncidents, ...prev].slice(0, 20));
  };

  // Analyze incidents with Claude API
  const analyzeIncidents = async () => {
    setLoading(true);
    const unanalyzed = incidents.filter(inc => !inc.analyzed);
    
    if (unanalyzed.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const prompt = `You are Santa's Head of Security Operations. Analyze these North Pole security incidents and respond with ONLY a JSON array (no markdown, no preamble).

For each incident, provide:
- severity: "CRITICAL", "HIGH", "MEDIUM", or "LOW"
- category: cyber security category (e.g., "Unauthorized Access", "Data Exfiltration", "Malware", "Social Engineering", "Insider Threat", etc.)
- summary: A festive 1-sentence summary
- action: Recommended action in festive terms
- naughtyScore: 0-100 (100 = very naughty)

Incidents to analyze:
${JSON.stringify(unanalyzed, null, 2)}

Respond with only the JSON array of analyzed incidents, each with the original id, user, event, timestamp fields plus the new analysis fields.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [{ role: "user", content: prompt }],
        })
      });

      const data = await response.json();
      const analysisText = data.content[0].text;
      const cleanJson = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      const analyzed = JSON.parse(cleanJson);
      
      // Mark as analyzed and merge
      const analyzedWithFlag = analyzed.map(inc => ({ ...inc, analyzed: true }));
      
      setIncidents(prev => {
        const updated = [...prev];
        analyzedWithFlag.forEach(analyzed => {
          const idx = updated.findIndex(inc => inc.id === analyzed.id);
          if (idx !== -1) {
            updated[idx] = analyzed;
          }
        });
        return updated;
      });
      
      setAnalyzedIncidents(prev => [...analyzedWithFlag, ...prev]);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Ho ho oh no! Analysis failed: ' + error.message);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (autoGenerate) {
      const interval = setInterval(() => {
        generateIncidents();
      }, 10000); // Generate every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoGenerate]);

  const getSeverityColor = (severity) => {
    const colors = {
      CRITICAL: 'bg-red-600',
      HIGH: 'bg-orange-500',
      MEDIUM: 'bg-yellow-500',
      LOW: 'bg-green-500'
    };
    return colors[severity] || 'bg-gray-500';
  };

  const getNaughtyColor = (score) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 50) return 'text-orange-500';
    if (score >= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const stats = {
    total: analyzedIncidents.length,
    critical: analyzedIncidents.filter(i => i.severity === 'CRITICAL').length,
    high: analyzedIncidents.filter(i => i.severity === 'HIGH').length,
    avgNaughty: analyzedIncidents.length > 0 
      ? Math.round(analyzedIncidents.reduce((sum, i) => sum + i.naughtyScore, 0) / analyzedIncidents.length)
      : 0
  };

  // Calculate Naughty & Nice List
  const generateNaughtyNiceList = () => {
    const userScores = {};
    
    analyzedIncidents.forEach(incident => {
      if (!userScores[incident.user]) {
        userScores[incident.user] = {
          user: incident.user,
          incidents: [],
          totalScore: 0,
          niceCount: 0,
          naughtyCount: 0
        };
      }
      
      userScores[incident.user].incidents.push(incident);
      userScores[incident.user].totalScore += incident.naughtyScore;
      
      if (incident.naughtyScore >= 50) {
        userScores[incident.user].naughtyCount++;
      } else {
        userScores[incident.user].niceCount++;
      }
    });
    
    // Calculate average score for each user
    const userList = Object.values(userScores).map(user => ({
      ...user,
      avgScore: Math.round(user.totalScore / user.incidents.length),
      status: (user.totalScore / user.incidents.length) >= 50 ? 'NAUGHTY' : 'NICE'
    }));
    
    // Sort by average score (worst first)
    userList.sort((a, b) => b.avgScore - a.avgScore);
    
    return userList;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-green-900 to-red-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            🎅 Santa's SOC Dashboard 🎄
          </h1>
          <p className="text-red-200 text-lg">
            North Pole Security Operations Center - Monitoring the Nice & Naughty
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/90 backdrop-blur rounded-lg p-4 shadow-lg border-2 border-red-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Incidents</p>
                <p className="text-3xl font-bold text-red-700">{stats.total}</p>
              </div>
              <Shield className="w-10 h-10 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur rounded-lg p-4 shadow-lg border-2 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Critical Alerts</p>
                <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur rounded-lg p-4 shadow-lg border-2 border-orange-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">High Priority</p>
                <p className="text-3xl font-bold text-orange-600">{stats.high}</p>
              </div>
              <Activity className="w-10 h-10 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur rounded-lg p-4 shadow-lg border-2 border-green-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Naughty Score</p>
                <p className="text-3xl font-bold text-green-700">{stats.avgNaughty}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/90 backdrop-blur rounded-lg p-4 shadow-lg mb-6 border-2 border-green-300">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={generateIncidents}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition-all hover:scale-105"
              >
                🎁 Generate Incidents
              </button>
              
              <button
                onClick={analyzeIncidents}
                disabled={loading || incidents.filter(i => !i.analyzed).length === 0}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition-all hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? '🎅 Analyzing...' : '🔍 Analyze with AI'}
              </button>

              <button
                onClick={() => setShowNaughtyNiceList(!showNaughtyNiceList)}
                disabled={analyzedIncidents.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition-all hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {showNaughtyNiceList ? '📋 Show Incidents' : '🎄 Naughty & Nice List'}
              </button>
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoGenerate}
                onChange={(e) => setAutoGenerate(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="font-semibold text-gray-700">Auto-generate incidents</span>
            </label>
          </div>
        </div>

        {/* Incidents List or Naughty & Nice List */}
        {showNaughtyNiceList ? (
          <div className="bg-white/90 backdrop-blur rounded-lg shadow-lg border-2 border-red-300 overflow-hidden">
            <div className="bg-gradient-to-r from-red-700 to-green-700 text-white px-6 py-4">
              <h2 className="text-2xl font-bold">🎅 Official Naughty & Nice List 🎄</h2>
              <p className="text-sm text-red-100 mt-1">Determining who gets presents this year...</p>
            </div>
            
            <div className="max-h-[600px] overflow-y-auto">
              {generateNaughtyNiceList().length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-xl">No data yet! Generate and analyze incidents first.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {generateNaughtyNiceList().map((user, idx) => (
                    <div key={user.user} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl font-bold text-gray-400">#{idx + 1}</span>
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-800">{user.user}</h3>
                              <span className={`${user.status === 'NICE' ? 'bg-green-500' : 'bg-red-600'} text-white px-4 py-1 rounded-full font-bold text-sm`}>
                                {user.status === 'NICE' ? '✨ NICE' : '🔥 NAUGHTY'}
                              </span>
                            </div>
                            
                            <div className="flex gap-4 text-sm text-gray-600 mb-3">
                              <span>Average Score: <strong className={getNaughtyColor(user.avgScore)}>{user.avgScore}/100</strong></span>
                              <span>Total Incidents: <strong>{user.incidents.length}</strong></span>
                              <span className="text-green-600">Nice: <strong>{user.niceCount}</strong></span>
                              <span className="text-red-600">Naughty: <strong>{user.naughtyCount}</strong></span>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Recent Activity:</p>
                              <ul className="space-y-1 text-sm text-gray-600">
                                {user.incidents.slice(0, 3).map((inc, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className={`${inc.naughtyScore >= 50 ? 'text-red-500' : 'text-green-500'}`}>•</span>
                                    <span>{inc.event}</span>
                                  </li>
                                ))}
                                {user.incidents.length > 3 && (
                                  <li className="text-gray-400 italic">+ {user.incidents.length - 3} more incidents...</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {user.status === 'NICE' ? (
                            <div className="text-green-600">
                              <div className="text-4xl mb-1">🎁</div>
                              <div className="font-bold text-sm">PRESENTS!</div>
                            </div>
                          ) : (
                            <div className="text-red-600">
                              <div className="text-4xl mb-1">🪨</div>
                              <div className="font-bold text-sm">COAL</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur rounded-lg shadow-lg border-2 border-red-300 overflow-hidden">
            <div className="bg-red-700 text-white px-6 py-4">
              <h2 className="text-2xl font-bold">Recent Security Incidents</h2>
            </div>
            
            <div className="max-h-[600px] overflow-y-auto">
              {incidents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-xl">🎄 All is calm, all is bright... for now!</p>
                  <p className="mt-2">Click "Generate Incidents" to start monitoring</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {incidents.map((incident) => (
                    <div key={incident.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-sm text-gray-500">{incident.id}</span>
                            <span className="font-semibold text-red-700">{incident.user}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(incident.timestamp).toLocaleString()}
                            </span>
                          </div>
                          
                          <p className="text-gray-800 mb-2">{incident.event}</p>
                          
                          {incident.analyzed && (
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className={`${getSeverityColor(incident.severity)} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                                  {incident.severity}
                                </span>
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                  {incident.category}
                                </span>
                                <span className={`${getNaughtyColor(incident.naughtyScore)} font-bold text-sm`}>
                                  {incident.naughtyScore >= 50 ? '🔥 Naughty' : '✨ Nice'} Score: {incident.naughtyScore}/100
                                </span>
                              </div>
                              
                              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                                <p className="text-sm text-gray-700">
                                  <strong>Summary:</strong> {incident.summary}
                                </p>
                              </div>
                              
                              <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                                <p className="text-sm text-gray-700">
                                  <strong>Recommended Action:</strong> {incident.action}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {!incident.analyzed && (
                            <div className="mt-2 text-sm text-gray-500 italic">
                              ⏳ Awaiting AI analysis...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SantaSOC;
