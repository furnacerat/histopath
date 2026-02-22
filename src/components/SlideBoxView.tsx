import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ZoomIn, ZoomOut, Maximize2, Sparkles, Loader2, ChevronLeft, Info, Microscope } from 'lucide-react';
import { SLIDES } from '../constants';
import { Slide } from '../types';
import { geminiService } from '../services/geminiService';
import Markdown from 'react-markdown';
import { cn } from '../lib/utils';

interface SlideBoxViewProps {
  onBack: () => void;
}

export const SlideBoxView: React.FC<SlideBoxViewProps> = ({ onBack }) => {
  const [slides, setSlides] = useState<Slide[]>(SLIDES);
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(SLIDES[0] || null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageError, setImageError] = useState(false);
  const [generatingImageFor, setGeneratingImageFor] = useState<string | null>(null);

  // Generate a DALL-E image for a slide if it doesn't have one
  const ensureSlideImage = useCallback(async (slide: Slide) => {
    if (slide.imageUrl || generatingImageFor === slide.id) return;
    setGeneratingImageFor(slide.id);
    try {
      const imagePrompt = (slide as any).imagePrompt
        || `${slide.title} histology slide, ${slide.stain} stain, ${slide.magnification} magnification`;
      const url = await geminiService.generateImage(imagePrompt);
      setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, imageUrl: url } : s));
      setSelectedSlide(prev => prev?.id === slide.id ? { ...prev, imageUrl: url } : prev);
    } catch (e) {
      console.warn('Image generation failed for:', slide.title);
    } finally {
      setGeneratingImageFor(null);
    }
  }, [generatingImageFor]);

  const filteredSlides = slides.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerateMore = async () => {
    setIsGenerating(true);
    try {
      const newSlides = await geminiService.generateSlides(5);
      setSlides(prev => [...prev, ...newSlides]);
    } catch (error) {
      console.error("Failed to generate slides", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedSlide) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await geminiService.askTutor(
        `Explain the histological features of this slide: ${selectedSlide.title}. 
        Description: ${selectedSlide.description}. 
        Stain: ${selectedSlide.stain}. 
        Magnification: ${selectedSlide.magnification}.`,
        "Provide a detailed breakdown of what a student should look for in this specific slide to identify it correctly on an exam."
      );
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSlideSelect = (slide: Slide) => {
    setSelectedSlide(slide);
    setAnalysis(null);
    setZoom(1);
    setImageError(false);
    ensureSlideImage(slide);
  };

  // Also generate image for the initially selected slide
  React.useEffect(() => {
    if (SLIDES[0]) ensureSlideImage(SLIDES[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-display italic text-slate-900">Virtual Slide Box</h1>
            <p className="text-sm text-slate-500">Digital Histology Atlas & Analysis</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search slides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all w-64"
            />
          </div>
          <button
            onClick={handleGenerateMore}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-bold hover:bg-indigo-500 transition-all disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            <span>Generate More</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Sidebar: Slide List */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Available Slides ({slides.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredSlides.map((slide) => (
              <button
                key={slide.id}
                onClick={() => handleSlideSelect(slide)}
                className={cn(
                  "w-full p-3 rounded-2xl text-left transition-all flex items-center space-x-3 group",
                  selectedSlide?.id === slide.id
                    ? "bg-slate-900 text-white shadow-lg"
                    : "hover:bg-slate-50 text-slate-600"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl overflow-hidden shrink-0 border",
                  selectedSlide?.id === slide.id ? "border-white/20" : "border-slate-100"
                )}>
                  {slide.imageUrl ? (
                    <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : generatingImageFor === slide.id ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-700">
                      <Loader2 size={16} className="text-indigo-400 animate-spin" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-700">
                      <Microscope size={16} className="text-slate-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{slide.title}</div>
                  <div className={cn(
                    "text-[10px] uppercase tracking-widest",
                    selectedSlide?.id === slide.id ? "text-slate-400" : "text-slate-400"
                  )}>
                    {slide.stain} • {slide.magnification}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Viewer & Analysis */}
        <div className="flex-1 flex flex-col min-w-0 space-y-6 overflow-y-auto lg:overflow-visible">
          {/* Viewer */}
          <div className="flex-1 min-h-[400px] bg-slate-900 rounded-[40px] relative overflow-hidden shadow-2xl group">
            {selectedSlide ? (
              <>
                <div
                  className="w-full h-full transition-transform duration-300 flex items-center justify-center"
                  style={{ transform: `scale(${zoom})` }}
                >
                  {generatingImageFor === selectedSlide.id ? (
                    <div className="flex flex-col items-center text-slate-400 space-y-4">
                      <Loader2 size={48} className="animate-spin text-indigo-400" />
                      <p className="text-sm font-medium">Generating image with DALL·E...</p>
                    </div>
                  ) : !imageError && selectedSlide.imageUrl ? (
                    <img
                      src={selectedSlide.imageUrl}
                      alt={selectedSlide.title}
                      className="max-w-full max-h-full object-contain select-none pointer-events-none"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-500 space-y-4 bg-slate-800/50 p-8 rounded-[32px] border border-white/5 backdrop-blur-sm">
                      <Microscope size={64} className="text-indigo-400 opacity-40 animate-pulse" />
                      <div className="text-center">
                        <p className="text-lg font-bold text-white mb-2">No Image Available</p>
                        <p className="text-sm text-slate-400 max-w-[200px]">Select a slide to generate its image, or try another slide.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Overlay Controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-2 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setZoom(prev => Math.max(1, prev - 0.5))}
                    className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
                  >
                    <ZoomOut size={20} />
                  </button>
                  <div className="w-px h-4 bg-white/20"></div>
                  <button
                    onClick={() => setZoom(prev => Math.min(4, prev + 0.5))}
                    className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
                  >
                    <ZoomIn size={20} />
                  </button>
                  <div className="w-px h-4 bg-white/20"></div>
                  <button
                    onClick={() => setZoom(1)}
                    className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
                  >
                    <Maximize2 size={20} />
                  </button>
                </div>

                {/* Slide Info Badge */}
                <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white">
                  <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-0.5">{selectedSlide.topic}</div>
                  <div className="text-sm font-bold">{selectedSlide.title}</div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                Select a slide to view
              </div>
            )}
          </div>

          {/* Analysis Section */}
          {selectedSlide && (
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 sm:p-8 shadow-sm shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                    <Info size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Slide Description</h3>
                    <p className="text-sm text-slate-500">{selectedSlide.stain} Stain • {selectedSlide.magnification} Magnification</p>
                  </div>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg"
                >
                  {isAnalyzing ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Sparkles size={18} className="text-amber-400" />
                  )}
                  <span>AI Slide Analysis</span>
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-slate-600 leading-relaxed">
                  {selectedSlide.description}
                </p>

                <AnimatePresence>
                  {analysis && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                      <div className="flex items-center space-x-2 mb-4 text-slate-900">
                        <Microscope size={18} />
                        <h4 className="font-bold text-sm uppercase tracking-widest">Tutor Insights</h4>
                      </div>
                      <div className="markdown-body prose prose-slate prose-sm max-w-none">
                        <Markdown>{analysis}</Markdown>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
