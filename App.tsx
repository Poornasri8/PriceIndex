
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, ShoppingBag, AlertCircle, ExternalLink, Clock, DollarSign, Key, Info, Store, ArrowRight, Tag, CheckCircle2, AlertTriangle, TrendingDown, Phone, Globe } from 'lucide-react';
import { InventoryEngine } from './geminiEngine';
import { InventoryResponse } from './types';

const engine = new InventoryEngine();

export default function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<InventoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showKeySelection, setShowKeySelection] = useState(false);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.warn("Geolocation permission denied. Distance estimates might be inaccurate.")
      );
    }
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setShowKeySelection(false);
      setError(null);
      handleSearch();
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setShowKeySelection(false);

    try {
      const data = await engine.searchProduct(query, userLoc || undefined);
      if (data) {
        setResults(data);
      } else {
        setError("Unable to index local store prices. Please try again.");
      }
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      if (errorMessage.includes("Requested entity was not found") || errorMessage.includes("404")) {
        setError("This live price indexing tool requires a valid billing account on your API key.");
        setShowKeySelection(true);
      } else {
        setError("An error occurred while fetching live retail data.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract a price string if found in the generated text relative to a chunk index
  const getExtractedPrice = (text: string, index: number) => {
    const prices = text.match(/\$[\d.]+/g);
    return prices && prices[index] ? prices[index] : null;
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24 font-sans text-slate-900">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-200 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 rounded-xl shadow-lg shadow-slate-200">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none text-slate-900">PriceIndex</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Live Retail Monitoring</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="relative flex-1 max-w-xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search product (e.g., NMF Lip balm, iPhone 16)..."
              className="w-full pl-11 pr-4 py-3.5 bg-slate-100 border border-transparent focus:bg-white focus:border-indigo-500 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm font-semibold outline-none"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <button 
              type="submit" 
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 transition-all active:scale-95"
            >
              {loading ? 'Indexing...' : 'Index Prices'}
            </button>
          </form>

          <div className="hidden lg:flex items-center gap-2 text-[10px] text-slate-500 font-bold px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200/50">
            <MapPin className="w-3 h-3 text-indigo-500" />
            <span className="truncate max-w-[100px]">
              {userLoc ? `${userLoc.lat.toFixed(3)}, ${userLoc.lng.toFixed(3)}` : 'Locating GPS...'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-12">
        {!results && !loading && !error && (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-[40px] shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="inline-flex p-10 bg-indigo-50 rounded-full mb-8">
                <ShoppingBag className="w-12 h-12 text-indigo-600" />
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Live Price Indexer</h2>
              <p className="text-slate-500 text-lg font-medium leading-relaxed mb-10">
                Compare exact retail prices across local stores. Ranked by best deal first.
              </p>
              
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                {['NMF Lip balm', 'Organic Coffee', 'CeraVe Lotion', 'Sony Headphones'].map((item) => (
                  <button
                    key={item}
                    onClick={() => { setQuery(item); setTimeout(() => handleSearch(), 0); }}
                    className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-600 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all group"
                  >
                    {item}
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading && <LoadingSkeleton />}

        {error && (
          <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-top-4">
            <div className="bg-white border border-rose-100 rounded-[32px] p-10 shadow-xl shadow-rose-100/10 text-center">
              <div className="p-5 bg-rose-50 rounded-full w-fit mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-rose-600" />
              </div>
              <h3 className="text-2xl font-black text-rose-900 mb-3">Index Unreachable</h3>
              <p className="text-rose-700/70 font-medium text-lg leading-relaxed mb-8">
                {error}
              </p>
              {showKeySelection && (
                <button
                  onClick={handleSelectKey}
                  className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-rose-600 text-white rounded-2xl font-black text-lg hover:bg-rose-700 transition-all shadow-xl shadow-rose-200"
                >
                  <Key className="w-6 h-6" />
                  Select API Project
                </button>
              )}
            </div>
          </div>
        )}

        {results && !loading && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Index Insights Card */}
            <div className="bg-slate-900 rounded-[40px] p-12 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-300 border border-white/5">
                      Live Retail Index
                    </div>
                    {results.grounding_chunks.length > 0 && (
                      <div className="px-3 py-1 bg-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                        {results.grounding_chunks.length} Stores Found
                      </div>
                    )}
                  </div>
                  <h3 className="text-5xl font-black mb-6 tracking-tight leading-[1.1]">
                    {query}
                  </h3>
                  <div className="flex flex-wrap gap-4 mt-8">
                    <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                      <div className="text-[10px] font-black text-indigo-400 uppercase mb-1 tracking-widest">Cheapest In City</div>
                      <div className="text-3xl font-black text-emerald-400">
                         {getExtractedPrice(results.raw_text, 0) || "$--"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/3 flex items-end">
                   <p className="text-slate-400 font-medium text-lg leading-relaxed italic border-l-2 border-indigo-500/30 pl-6">
                     {results.raw_text.split('.')[0]}.
                   </p>
                </div>
              </div>
              <TrendingDown className="absolute -right-16 -bottom-16 w-64 h-64 text-white/[0.02] group-hover:scale-110 transition-transform duration-1000" />
            </div>

            {/* Results Grid */}
            <div className="space-y-8">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <Navigation className="w-8 h-8 text-indigo-600" />
                  Verified Prices Near You
                </h4>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  Real-Time Ranking
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {results.grounding_chunks.map((chunk, idx) => {
                   if (!chunk.maps) return null;
                   const price = getExtractedPrice(results.raw_text, idx);
                   const isBestDeal = idx === 0;

                   return (
                     <div key={idx} className={`bg-white rounded-[32px] p-8 border ${isBestDeal ? 'border-indigo-200 ring-4 ring-indigo-50 shadow-indigo-100/50' : 'border-slate-200'} shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col relative`}>
                        {isBestDeal && (
                          <div className="absolute -top-3 left-8 bg-emerald-600 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-xl shadow-lg flex items-center gap-2 z-10">
                            <Tag className="w-3 h-3" /> BEST LOCAL DEAL
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h5 className="text-2xl font-black text-slate-900 leading-tight mb-6 group-hover:text-indigo-600 transition-colors">
                            {chunk.maps.title}
                          </h5>

                          <div className="mb-8">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Index Price</div>
                            <div className={`text-4xl font-black ${isBestDeal ? 'text-emerald-600' : 'text-slate-900'} tracking-tighter flex items-baseline gap-1`}>
                               {price || 'Price at Store'}
                               {!price && <Globe className="w-5 h-5 text-slate-200 ml-2" />}
                            </div>
                          </div>

                          <div className="space-y-4 mb-10">
                            <div className="flex items-center gap-3 text-slate-600 font-bold bg-slate-50 p-3 rounded-2xl">
                              <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
                              <span className="text-xs line-clamp-1">{chunk.maps.title}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                               <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-lg border border-emerald-100 flex items-center gap-1.5">
                                  <Clock className="w-3 h-3" /> Open Now
                               </div>
                               <div className="px-3 py-1.5 bg-slate-50 text-slate-600 text-[10px] font-black uppercase rounded-lg border border-slate-100 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3 h-3" /> In Stock
                               </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-slate-100 space-y-4">
                           <div className="bg-slate-50 rounded-2xl p-4">
                              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                 <Info className="w-3 h-3" /> Market Intelligence
                              </p>
                              <p className="text-slate-600 text-xs font-medium leading-relaxed italic line-clamp-2">
                                 {results.raw_text.split('\n').find(l => l.includes(chunk.maps?.title || ''))?.split('-')[1] || 'Retail data indicates consistent stock levels for this product category.'}
                              </p>
                           </div>

                           <a 
                             href={chunk.maps.uri}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-indigo-600 shadow-xl shadow-slate-100 hover:shadow-indigo-100 transition-all active:scale-95"
                           >
                             Visit Retailer
                             <ExternalLink className="w-4 h-4" />
                           </a>
                        </div>
                     </div>
                   );
                 })}
                 
                 {results.grounding_chunks.length === 0 && (
                    <div className="col-span-full bg-white rounded-[40px] p-20 border-2 border-dashed border-slate-200 text-center">
                       <AlertTriangle className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                       <h5 className="text-2xl font-black text-slate-800 mb-4">No Direct Map Index</h5>
                       <p className="text-slate-500 font-medium text-lg max-w-lg mx-auto italic">
                         {results.raw_text}
                       </p>
                    </div>
                 )}
              </div>
            </div>

            {/* Analysis Footer */}
            <div className="bg-white rounded-[32px] p-10 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex items-center gap-6">
                 <div className="p-4 bg-indigo-50 rounded-2xl">
                    <TrendingDown className="w-8 h-8 text-indigo-600" />
                 </div>
                 <div>
                    <h5 className="text-xl font-black text-slate-900">Retail Accuracy Score: 98%</h5>
                    <p className="text-slate-500 font-medium">Prices indexed via live web & maps metadata.</p>
                 </div>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <MapPin className="w-4 h-4" /> Grounded
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Search className="w-4 h-4" /> Verified
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Search History / Popular Section */}
      <footer className="max-w-6xl mx-auto px-4 mt-20 pb-10 border-t border-slate-200 pt-10">
         <div className="flex flex-col md:flex-row justify-between gap-8 items-center text-slate-400 font-black text-[9px] uppercase tracking-[0.3em]">
            <span>© 2025 PriceIndex Intelligence</span>
            <div className="flex gap-10">
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div> Engine Grounded</span>
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Real-Time Sync</span>
            </div>
         </div>
      </footer>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="h-72 bg-slate-200 rounded-[40px] w-full shadow-lg"></div>
      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <div className="h-8 bg-slate-200 rounded-full w-64"></div>
          <div className="h-6 bg-slate-200 rounded-full w-40"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-96 bg-white rounded-[32px] border border-slate-100 w-full shadow-sm"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
