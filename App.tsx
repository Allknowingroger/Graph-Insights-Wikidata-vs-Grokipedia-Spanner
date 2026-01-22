
import React, { useState, useEffect, useRef } from 'react';
import { performAnalysis, generateWhitepaper } from './services/geminiService';
import { AnalysisResponse } from './types';
import KnowledgeGraph from './components/KnowledgeGraph';
import { 
  Database, 
  Search, 
  ExternalLink, 
  Zap, 
  Network, 
  Layers,
  Info,
  ChevronRight,
  RefreshCw,
  LayoutGrid,
  FileText,
  Send,
  X,
  Copy,
  CheckCircle
} from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Storage');
  const [customQuery, setCustomQuery] = useState('');
  const [whitepaper, setWhitepaper] = useState<string | null>(null);
  const [generatingWhitepaper, setGeneratingWhitepaper] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchData = async (query = "Deep technical comparison of Wikidata vs Spanner Graph (Grokipedia)") => {
    setLoading(true);
    setError(null);
    try {
      const result = await performAnalysis(query);
      setData(result);
      if (result.comparison.length > 0) {
        setActiveTab(result.comparison[0].category);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch analysis data.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWhitepaper = async () => {
    if (!data) return;
    setGeneratingWhitepaper(true);
    try {
      const doc = await generateWhitepaper(data);
      setWhitepaper(doc);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingWhitepaper(false);
    }
  };

  const copyToClipboard = () => {
    if (whitepaper) {
      navigator.clipboard.writeText(whitepaper);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const categories = Array.from(new Set(data?.comparison.map(c => c.category) || []));

  if (loading && !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-blue-500 blur-2xl opacity-10 animate-pulse"></div>
          <div className="relative animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Synthesizing Knowledge</h2>
        <p className="text-slate-500 max-w-md animate-pulse">Mapping relationships between Wikidata's RDF and Spanner's distributed property graph...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 transition-all duration-500 bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-200 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg shadow-lg shadow-blue-500/20">
              <Network className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Graph Insights</h1>
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest flex items-center gap-1">
                {loading ? <RefreshCw size={10} className="animate-spin" /> : <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                {loading ? "Researching Web..." : "Analysis Live"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => fetchData()}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
              title="Reset Analysis"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        {/* Hero Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full border border-blue-100 uppercase tracking-widest">
                <Layers size={12} />
                <span>TECHNICAL REPORT V2.1</span>
              </div>
              <h2 className="text-4xl lg:text-6xl font-extrabold leading-[1.1] text-slate-900">
                Global KB vs. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Enterprise Graph</span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed font-normal">
                {data?.overview}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  onClick={handleGenerateWhitepaper}
                  disabled={generatingWhitepaper}
                  className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 hover:scale-[1.02] transition-all shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50"
                >
                  {generatingWhitepaper ? <RefreshCw className="animate-spin" size={20} /> : <FileText size={20} />}
                  Generate Whitepaper
                </button>
                <a href="https://grokipedia.com/page/Spanner_Graph" target="_blank" className="flex items-center gap-2 px-6 py-4 bg-white text-slate-900 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm">
                  Source: Grokipedia <ExternalLink size={18} />
                </a>
              </div>
            </div>
            <KnowledgeGraph />
          </div>
        </section>

        {/* Dynamic Comparison Tabs */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8 border-b border-slate-200">
            <div className="flex gap-8 overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
                    activeTab === cat ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {cat}
                  {activeTab === cat && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.3)]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.comparison
              .filter(item => item.category === activeTab)
              .map((item, idx) => (
                <div key={idx} className="glass-panel p-6 rounded-3xl flex flex-col h-full border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all group bg-white shadow-sm">
                  <h4 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                  <p className="text-xs text-slate-500 mb-6 leading-relaxed line-clamp-3">{item.description}</p>
                  
                  <div className="mt-auto space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">WIKIDATA</span>
                      <p className="text-sm text-slate-700 font-medium">{item.wikidataValue}</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-600 block mb-1 uppercase tracking-wider">SPANNER GRAPH</span>
                      <p className="text-sm text-slate-700 font-medium">{item.grokipediaValue}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>

        {/* Key Differences & Grounding */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          <div className="lg:col-span-2 glass-panel rounded-[2rem] p-8 border-slate-100 bg-white shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Zap className="text-amber-500" fill="currentColor" />
              <h3 className="text-2xl font-bold text-slate-900">Strategic Divergence</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data?.keyDifferences.map((diff, idx) => (
                <div key={idx} className="flex gap-4 p-5 bg-slate-50 rounded-2xl items-start group hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200">
                  <div className="p-2 bg-blue-100 rounded-xl text-blue-600 shrink-0 group-hover:scale-110 transition-transform">
                    <ChevronRight size={18} />
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{diff}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="glass-panel rounded-[2rem] p-8 border-slate-100 bg-white shadow-sm h-full">
              <div className="flex items-center gap-3 mb-6">
                <Search className="text-blue-600" />
                <h3 className="text-xl font-bold text-slate-900">Web Verification</h3>
              </div>
              <div className="space-y-3">
                {data?.sources?.map((src, idx) => (
                  <a 
                    key={idx} 
                    href={src.uri} 
                    target="_blank" 
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all group border border-transparent hover:border-slate-200"
                  >
                    <span className="text-xs text-slate-600 font-medium truncate pr-4">{src.title}</span>
                    <ExternalLink size={12} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Query Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-6 z-50">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (customQuery.trim()) {
              fetchData(`Follow-up research: ${customQuery} (Context: Comparing Wikidata vs Spanner Graph)`);
              setCustomQuery('');
            }
          }}
          className="relative group"
        >
          <div className="absolute inset-0 bg-blue-600/10 blur-3xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <input 
            type="text"
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder="Ask a technical follow-up question..."
            className="w-full h-16 bg-white border border-slate-200 rounded-3xl px-6 pr-16 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-2xl"
          />
          <button 
            type="submit"
            className="absolute right-3 top-3 bottom-3 aspect-square bg-slate-900 rounded-2xl flex items-center justify-center text-white hover:bg-slate-800 transition-colors shadow-lg active:scale-95"
          >
            <Send size={20} />
          </button>
        </form>
      </div>

      {/* Whitepaper Modal */}
      {whitepaper && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setWhitepaper(null)} />
          <div className="relative bg-white w-full max-w-5xl h-full rounded-[2.5rem] flex flex-col overflow-hidden border border-slate-200 shadow-[0_0_100px_rgba(0,0,0,0.1)]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-600" />
                <h3 className="font-bold text-xl text-slate-900">Technical Architecture Whitepaper</h3>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-sm font-semibold transition-all border border-slate-200"
                >
                  {copied ? <CheckCircle size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy MD'}
                </button>
                <button 
                  onClick={() => setWhitepaper(null)}
                  className="p-2.5 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <X size={24} className="text-slate-500" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 lg:p-16 prose prose-slate max-w-none">
              <div className="whitespace-pre-wrap font-serif text-slate-700 leading-relaxed text-lg lg:text-xl">
                {whitepaper}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
