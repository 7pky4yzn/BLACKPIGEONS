import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { X, Search, FileText, Download, ExternalLink, ChevronDown, LayoutGrid, List as ListIcon, Filter, Info, Loader2, Mail, Github, MessageSquare } from 'lucide-react';
import Lenis from 'lenis';
import * as XLSX from 'xlsx';

// ==========================================
// PAGE CONDITIONS
// ==========================================
// Toggle these to true to show the respective status pages
const PAGE_CONDITIONS = {
  isUnderMaintenance: true,
  isAddingNewContent: false,
};

// ==========================================
// DATABASE CONFIGURATION
// ==========================================
// Automatically find database.xlsx anywhere in the src folder during the build process.
// If it's not found in src, it falls back to checking the public root.
const excelFiles = import.meta.glob('/src/**/database.xlsx', { eager: true, import: 'default', query: '?url' });
const DATABASE_URL = (Object.values(excelFiles)[0] as string) || '/database.xlsx';

type FileType = 'PDF' | 'DOCX' | 'PPTX' | 'ZIP' | string;
const FILE_TYPES: FileType[] = ['PDF', 'DOCX', 'PPTX', 'ZIP'];

interface Item {
  id: number;
  title: string;
  timestamp: number;
  date: string;
  sizeInMB: number;
  size: string;
  type: FileType;
  url: string;
}

interface HomeProps {
  onNavigate: () => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FileType | 'All'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'size' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const browseSectionRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true, smoothWheel: true, duration: 1.2 });
    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(DATABASE_URL);
        if (!response.ok) {
          throw new Error('Could not find any .xlsx database file. Please add one to your repository.');
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          throw new Error('Could not find any .xlsx database file. Please add one to your repository.');
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const parsedItems: Item[] = jsonData.map((row: any, index) => {
          const title = row.Title || `Document ${index + 1}`;
          const dateStr = row.Date || new Date().toISOString();
          const timestamp = new Date(dateStr).getTime() || Date.now();
          const sizeInMB = parseFloat(row.Size) || 0;
          const type = (row.Type || 'PDF').toString().toUpperCase();
          const url = row.Link || '#';

          return {
            id: index + 1,
            title,
            timestamp,
            date: new Date(timestamp).toLocaleDateString(),
            sizeInMB,
            size: sizeInMB > 0 ? `${sizeInMB.toFixed(2)} MB` : 'Unknown Size',
            type,
            url
          };
        });

        setItems(parsedItems);
      } catch (err: any) {
        console.error('Error loading database:', err);
        setError(err.message || 'Failed to load database.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (mainContentRef.current) {
      gsap.fromTo(mainContentRef.current, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  useEffect(() => {
    if (containerRef.current && items.length > 0 && !isLoading) {
      // Animate list items smoothly using GSAP
      const children = containerRef.current.children;
      gsap.fromTo(children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.02, ease: "power2.out", clearProps: "all" }
      );
    }
  }, [viewMode, isLoading]); // Re-animate on view mode change

  const filteredItems = useMemo(() => {
    let result = items;
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(lowerQuery) || 
        item.id.toString().includes(lowerQuery)
      );
    }
    if (filterType !== 'All') result = result.filter(item => item.type === filterType);
    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') comparison = a.timestamp - b.timestamp;
      else if (sortBy === 'size') comparison = a.sizeInMB - b.sizeInMB;
      else if (sortBy === 'title') comparison = a.title.localeCompare(b.title);
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return result;
  }, [items, searchQuery, filterType, sortBy, sortOrder]);

  if (PAGE_CONDITIONS.isUnderMaintenance || PAGE_CONDITIONS.isAddingNewContent || error) {
    let title = '';
    let message = '';
    let icon = null;

    if (PAGE_CONDITIONS.isUnderMaintenance) {
      title = 'Under Maintenance';
      message = 'We are currently performing scheduled maintenance to improve your experience. Please check back later.';
      icon = <Loader2 className="w-16 h-16 text-white/50 animate-spin mb-6" />;
    } else if (PAGE_CONDITIONS.isAddingNewContent) {
      title = 'Adding New Content';
      message = 'We are currently updating our database with fresh materials. The archives will be back online shortly!';
      icon = <FileText className="w-16 h-16 text-white/50 mb-6" />;
    } else if (error) {
      title = 'Database Unavailable';
      message = 'We are having trouble connecting to the archives right now. Our team has been notified and is working on it.';
      icon = <X className="w-16 h-16 text-red-400 mb-6" />;
    }

    return (
      <div className="min-h-screen w-full bg-[#000000] text-[#f5f5f7] selection:bg-white/30 font-sans relative overflow-hidden flex items-center justify-center">
        <div className="atmosphere absolute inset-0 pointer-events-none z-0"></div>
        
        <div className="progressive-blur">
          <div /><div /><div /><div /><div /><div /><div />
        </div>
        <div className="progressive-blur-bottom">
          <div /><div /><div /><div /><div /><div /><div />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
          {icon}
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">{title}</h1>
          <p className="text-[#86868b] text-lg mb-10 leading-relaxed">{message}</p>
          
          <div className="flex flex-col w-full gap-4 items-center">
            <p className="text-sm text-white/40 uppercase tracking-widest font-semibold mb-2">Contact Support</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="mailto:support@example.com" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-6 py-3 transition-all duration-300">
                <Mail size={18} />
                <span>Email</span>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-6 py-3 transition-all duration-300">
                <Github size={18} />
                <span>GitHub</span>
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-6 py-3 transition-all duration-300">
                <MessageSquare size={18} />
                <span>Discord</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#000000] text-[#f5f5f7] selection:bg-white/30 font-sans relative">
      <div className="atmosphere absolute inset-0 pointer-events-none z-0"></div>
      
      <div className="progressive-blur">
        <div /><div /><div /><div /><div /><div /><div />
      </div>
      <div className="progressive-blur-bottom">
        <div /><div /><div /><div /><div /><div /><div />
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-32">
        <div ref={mainContentRef} className="opacity-0">
          <div className="max-w-7xl mx-auto px-6 mb-8 flex justify-between items-center" ref={browseSectionRef}>
                <h2 className="font-sans font-semibold text-2xl md:text-3xl tracking-tight text-white/90">Browse</h2>
                <div className="flex bg-white/5 rounded-full p-1 border border-white/10 backdrop-blur-md">
                  <button 
                    onClick={() => setIsFilterOpen(true)} 
                    className={`p-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 text-[#86868b] hover:text-white`}
                    aria-label="Filter"
                  >
                    <Filter size={18} />
                  </button>
                  <div className="w-px bg-white/10 mx-1 my-2"></div>
                  <button 
                    onClick={() => setViewMode('grid')} 
                    className={`p-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${viewMode === 'grid' ? 'bg-white text-black' : 'text-[#86868b] hover:text-white'}`}
                    aria-label="Grid View"
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')} 
                    className={`p-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 ${viewMode === 'list' ? 'bg-white text-black' : 'text-[#86868b] hover:text-white'}`}
                    aria-label="List View"
                  >
                    <ListIcon size={18} />
                  </button>
                </div>
              </div>

              <div className={`max-w-7xl mx-auto px-6 pb-40 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'flex flex-col gap-4'}`} ref={containerRef}>
                {isLoading ? (
                  <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-32 text-white/50">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="font-sans">Loading database...</p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-[#86868b] py-10 col-span-1 md:col-span-2 text-center font-sans">No archives found.</div>
                ) : (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`group bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300 hover:scale-[0.98] active:scale-[0.96] rounded-[2rem] cursor-pointer relative overflow-hidden ${
                        viewMode === 'grid' 
                          ? 'p-8 md:p-12 flex flex-col justify-between aspect-square' 
                          : 'p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      {viewMode === 'grid' ? (
                        <>
                          <div className="flex justify-between text-xs text-[#86868b] relative z-10 font-mono">
                            <span>{item.type}</span>
                            <span>{item.size}</span>
                          </div>
                          <div className="text-center relative z-10">
                            <h3 className="font-sans text-2xl md:text-3xl tracking-tight font-semibold">{item.title}</h3>
                          </div>
                          <div className="flex justify-between text-xs text-[#86868b] relative z-10 font-mono">
                            <span>#{item.id.toString().padStart(4, '0')}</span>
                            <span>{item.date}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-4 md:gap-6 relative z-10">
                            <div className="text-xs text-[#86868b] font-mono w-12 hidden sm:block">#{item.id.toString().padStart(4, '0')}</div>
                            <h3 className="font-sans text-lg md:text-xl tracking-tight font-semibold">{item.title}</h3>
                          </div>
                          <div className="flex items-center gap-4 md:gap-6 text-xs text-[#86868b] mt-4 md:mt-0 relative z-10 font-mono">
                            <span className="bg-white/5 px-3 py-1.5 rounded-full border border-white/5">{item.type}</span>
                            <span className="w-16 text-right">{item.size}</span>
                            <span className="hidden sm:inline w-24 text-right">{item.date}</span>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
      </div>

      {/* Floating Search Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3">
        <div 
          className="GlassContainer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" 
          style={{ width: isSearchFocused ? 320 : 240, '--corner-radius': '9999px' } as React.CSSProperties}
        >
          <div className="GlassContent p-2">
            <div className="relative flex items-center w-full">
              <Search className="absolute left-4 text-white/50" size={18} />
              <input
                type="text"
                placeholder="Search archives..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full bg-transparent border-none outline-none text-white placeholder:text-white/40 pl-12 pr-10 py-3 text-sm font-sans"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 text-white/50 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="GlassMaterial">
            <div className="GlassEdgeReflection"></div>
            <div className="GlassEmbossReflection"></div>
            <div className="GlassRefraction"></div>
            <div className="GlassBlur"></div>
            <div className="BlendLayers"></div>
            <div className="BlendEdge"></div>
            <div className="Highlight"></div>
          </div>
        </div>

        <div onClick={onNavigate} className="flex items-center justify-center cursor-pointer">
          <button
            className="w-8 h-8 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 active:scale-95 shadow-[0_0_10px_rgba(0,0,0,0.5)] group"
            aria-label="Site Information"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white/60 group-hover:bg-white transition-colors" />
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setIsFilterOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#111] border border-white/10 rounded-[2rem] p-8 max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-sans font-semibold text-2xl tracking-tight">Filter & Sort</h3>
                <button onClick={() => setIsFilterOpen(false)} className="bg-white/5 hover:bg-white/10 rounded-full p-2 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-8">
                <div className="text-white/40 text-xs mb-3 font-sans">Filter by Type</div>
                <div className="flex flex-wrap gap-2">
                  {['All', ...FILE_TYPES].map(type => (
                    <button 
                      key={type}
                      onClick={() => setFilterType(type as any)}
                      className={`px-5 py-2.5 rounded-full text-xs font-sans transition-colors ${
                        filterType === type 
                          ? 'bg-white text-black' 
                          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <div className="text-white/40 text-xs mb-3 font-sans">Sort by</div>
                <div className="relative">
                  <select 
                    value={`${sortBy}-${sortOrder}`} 
                    onChange={(e) => {
                      const [newSortBy, newSortOrder] = e.target.value.split('-');
                      setSortBy(newSortBy as any);
                      setSortOrder(newSortOrder as any);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-12 text-white text-sm font-sans focus:outline-none focus:bg-white/10 appearance-none cursor-pointer transition-colors"
                  >
                    <option value="date-desc" className="bg-[#111] text-white">Date (Newest)</option>
                    <option value="date-asc" className="bg-[#111] text-white">Date (Oldest)</option>
                    <option value="size-desc" className="bg-[#111] text-white">Size (Largest)</option>
                    <option value="size-asc" className="bg-[#111] text-white">Size (Smallest)</option>
                    <option value="title-asc" className="bg-[#111] text-white">Title (A-Z)</option>
                    <option value="title-desc" className="bg-[#111] text-white">Title (Z-A)</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={18} />
                </div>
              </div>

              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-white text-black rounded-full py-4 text-sm font-sans hover:bg-white/90 transition-colors font-bold"
              >
                Apply & Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#000000]/80 backdrop-blur-3xl border border-white/[0.08] shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-[2rem] p-8 md:p-12 max-w-lg w-full relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
              
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-6 right-6 bg-white/5 hover:bg-white/10 rounded-full p-3 transition-colors text-white/60 hover:text-white z-10"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-2 text-[#86868b] text-xs mb-6 relative z-10 font-sans">
                <FileText size={14} />
                <span>File Details</span>
              </div>
              
              <h2 className="font-sans text-3xl md:text-4xl tracking-tight mb-8 leading-tight font-semibold relative z-10">
                {selectedItem.title}
              </h2>
              
              <div className="bg-white/[0.02] rounded-[1.5rem] p-6 space-y-4 mb-8 text-sm relative z-10 border border-white/[0.03] font-sans">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-[#86868b]">ID</span>
                  <span className="text-white font-mono">#{selectedItem.id.toString().padStart(4, '0')}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-[#86868b]">Date Added</span>
                  <span className="text-white font-mono">{selectedItem.date}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-[#86868b]">File Size</span>
                  <span className="text-white font-mono">{selectedItem.size}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[#86868b]">Type</span>
                  <span className="text-white font-mono">{selectedItem.type} Document</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                <a 
                  href={selectedItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-white text-black rounded-full py-4 flex items-center justify-center gap-2 text-sm hover:bg-white/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-bold font-sans"
                >
                  <ExternalLink size={18} />
                  Open File
                </a>
                <a 
                  href={selectedItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-white/10 text-white rounded-full py-4 flex items-center justify-center gap-2 text-sm hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-bold border border-white/10 font-sans"
                >
                  <Download size={18} />
                  Download
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
