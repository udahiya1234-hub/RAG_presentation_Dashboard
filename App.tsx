import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  MessageSquare, 
  Zap, 
  CheckCircle, 
  Code, 
  Database, 
  Brain, 
  Globe, 
  Target, 
  AlertCircle, 
  TrendingUp, 
  Users, 
  Clock, 
  Cpu, 
  HardDrive, 
  Activity, 
  BarChart3,
  Play,
  Square,
  SkipForward,
  Volume2,
  Settings
} from 'lucide-react';

// --- Tour Data Configuration ---
const TOUR_STEPS = [
  { 
    id: 'tour-header', 
    tab: 'overview', 
    title: 'Welcome', 
    text: 'Welcome to the RAG Project Dashboard. This interactive dashboard showcases our Capstone Project: a NotebookLM-style Retrieval Augmented Generation system.' 
  },
  { 
    id: 'tour-objective', 
    tab: 'overview', 
    title: 'Project Objective', 
    text: 'Our main objective was to build an intelligent chatbot capable of answering domain-specific questions by understanding your custom documents, utilizing advanced vector databases and LLMs.' 
  },
  { 
    id: 'tour-stats', 
    tab: 'overview', 
    title: 'Key Statistics', 
    text: 'Here are the key metrics. We achieved a query response time of under 2 seconds and built 8 core learning features with just around 1500 lines of efficient Python code.' 
  },
  { 
    id: 'tour-problem', 
    tab: 'problem', 
    title: 'The Challenge', 
    text: 'Manual document processing is slow and error-prone. We solved this by automating the extraction of insights and providing instant, grounded answers through AI.' 
  },
  { 
    id: 'tour-architecture', 
    tab: 'architecture', 
    title: 'System Architecture', 
    text: 'This is our pipeline. Documents are extracted using PyMuPDF, chunked into smaller pieces, vectorized using TF-IDF, and then processed by the GROQ LLM to generate answers.' 
  },
  { 
    id: 'tour-features', 
    tab: 'features', 
    title: 'Core Features', 
    text: 'Beyond simple chat, our system generates summaries, mind maps, quizzes, and even audio flashcards to enhance the learning experience.' 
  },
  { 
    id: 'tour-tech', 
    tab: 'tech', 
    title: 'Technology Stack', 
    text: 'We utilized a robust stack featuring Streamlit for the UI, GROQ for fast inference, and Scikit-learn for efficient, CPU-friendly vectorization.' 
  },
  { 
    id: 'tour-metrics', 
    tab: 'metrics', 
    title: 'Performance', 
    text: 'Finally, our performance metrics show the system is highly optimized, with retrieval speeds under 100 milliseconds and low memory footprint.' 
  }
];

// --- Visual Components ---

const TourActiveLabel = ({ activeId }: { activeId: string }) => {
  const step = TOUR_STEPS.find(s => s.id === activeId);
  const label = step ? step.title : "ACTIVE SECTION";

  return (
    <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 z-[60] w-max max-w-[90vw] pointer-events-none">
       <div className="animate-bounce flex flex-col items-center">
         <div className="bg-gray-900 text-white text-sm md:text-base font-bold px-5 py-2.5 rounded-full shadow-2xl border-2 border-yellow-400 flex items-center gap-2.5">
          <Volume2 className="w-4 h-4 text-yellow-400 animate-pulse fill-current" />
          <span className="uppercase tracking-wide">{label}</span>
        </div>
        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-t-[8px] border-t-gray-900 border-r-[8px] border-r-transparent mt-[-1px]"></div>
      </div>
    </div>
  );
};

interface SimpleTooltipProps { 
  content: string; 
  children: React.ReactNode; 
  side?: 'top' | 'bottom';
  className?: string;
}

const SimpleTooltip: React.FC<SimpleTooltipProps> = ({ 
  content, 
  children, 
  side = 'top',
  className = ""
}) => {
  const [show, setShow] = useState(false);
  
  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <div 
        className={`absolute ${side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 transition-opacity duration-200 pointer-events-none z-[70] shadow-xl w-max max-w-[200px] text-center ${show ? 'opacity-100' : ''}`}
      >
        {content}
        {side === 'top' ? (
           <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        ) : (
           <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900"></div>
        )}
      </div>
    </div>
  );
};

const RAGProjectDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isVisible, setIsVisible] = useState(false);
  
  // Tour State
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Audio Settings State
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  // Audio Ref
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsVisible(true);
    // Cleanup audio on unmount
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Load available voices
  useEffect(() => {
    const updateVoices = () => {
      const available = window.speechSynthesis.getVoices();
      
      // Sort voices: English first, then alphabetical
      const sortedVoices = [...available].sort((a, b) => {
        const aIsEnglish = a.lang.startsWith('en');
        const bIsEnglish = b.lang.startsWith('en');
        
        if (aIsEnglish && !bIsEnglish) return -1;
        if (!aIsEnglish && bIsEnglish) return 1;
        return a.name.localeCompare(b.name);
      });
      
      setVoices(sortedVoices);

      if (sortedVoices.length > 0 && !selectedVoiceName) {
        // Try to find a good default (Google US or any English)
        const defaultVoice = sortedVoices.find(v => v.name === 'Google US English') 
                          || sortedVoices.find(v => v.lang === 'en-US')
                          || sortedVoices.find(v => v.lang.startsWith('en'))
                          || sortedVoices[0];
        if (defaultVoice) setSelectedVoiceName(defaultVoice.name);
      }
    };
    
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, [selectedVoiceName]);

  // Handle Tour Navigation and Audio
  useEffect(() => {
    if (isTourActive) {
      const step = TOUR_STEPS[currentStepIndex];
      
      // Switch tab if needed
      if (activeTab !== step.tab) {
        setActiveTab(step.tab);
      }

      // Scroll to element
      setTimeout(() => {
        const element = document.getElementById(step.id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300); // Slight delay to allow tab switch render

      // Speak (triggered also when settings change)
      if (isPlaying) {
        speak(step.text);
      }
    } else {
      window.speechSynthesis.cancel();
    }
  }, [currentStepIndex, isTourActive, isPlaying, activeTab, speechRate, selectedVoiceName]);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select Voice
    if (selectedVoiceName) {
      const voice = voices.find(v => v.name === selectedVoiceName);
      if (voice) utterance.voice = voice;
    }
    
    utterance.rate = speechRate;
    utterance.pitch = 1;
    
    utterance.onend = () => {
      // Optional: Auto-advance could go here
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const startTour = () => {
    setIsTourActive(true);
    setCurrentStepIndex(0);
    setIsPlaying(true);
    // Needed to ensure voices are loaded if not already
    if (voices.length === 0) {
      const vs = window.speechSynthesis.getVoices();
      setVoices(vs);
    }
  };

  const stopTour = () => {
    setIsTourActive(false);
    setIsPlaying(false);
    setShowSettings(false);
    window.speechSynthesis.cancel();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextStep = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setIsPlaying(true); // Ensure it keeps speaking
    } else {
      stopTour();
    }
  };

  const currentStep = TOUR_STEPS[currentStepIndex];

  // Helper for sub-components to determine highlight style
  const activeTourId = isTourActive ? currentStep.id : null;

  const tabs = [
    { id: 'overview', label: 'Project Overview', icon: Target, desc: 'View summary, key stats, and objectives' },
    { id: 'problem', label: 'Problem & Solution', icon: AlertCircle, desc: 'Understand the business challenge and our solution' },
    { id: 'architecture', label: 'Architecture', icon: Database, desc: 'Explore the technical system design and pipeline' },
    { id: 'features', label: 'Features', icon: Zap, desc: 'Discover the core capabilities of the system' },
    { id: 'tech', label: 'Tech Stack', icon: Code, desc: 'See the languages, frameworks, and tools used' },
    { id: 'metrics', label: 'Metrics', icon: TrendingUp, desc: 'Analyze performance benchmarks and code stats' }
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8 ${isTourActive ? 'overflow-hidden h-screen' : ''}`}>
      {/* Tour Overlay Backdrop */}
      {isTourActive && (
        <div className="fixed inset-0 bg-black/80 z-40 transition-opacity duration-500 backdrop-blur-sm pointer-events-none" />
      )}

      <div className="max-w-7xl mx-auto relative z-30">
        {/* Header */}
        <div 
          id="tour-header"
          className={`bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 mb-8 border-t-4 border-yellow-400 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'} ${activeTourId === 'tour-header' ? 'relative z-50 ring-4 ring-yellow-400 scale-[1.02]' : ''}`}
        >
          {activeTourId === 'tour-header' && <TourActiveLabel activeId="tour-header" />}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 animate-pulse text-center md:text-left">
                NotebookLM-Style RAG System
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 text-center md:text-left">
                AI-Powered Business Intelligence Platform
              </p>
              <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                <SimpleTooltip content="Academic milestone identification">
                  <span className="px-4 py-2 bg-white text-blue-700 rounded-full text-sm font-bold shadow-lg cursor-default">
                    Capstone Project
                  </span>
                </SimpleTooltip>
                <SimpleTooltip content="Specialization track">
                  <span className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-full text-sm font-bold shadow-lg cursor-default">
                    Data Science with GenAI
                  </span>
                </SimpleTooltip>
                {!isTourActive && (
                  <SimpleTooltip content="Begin an interactive voice-guided tour of the dashboard">
                    <button 
                      onClick={startTour}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-full text-sm font-bold shadow-lg transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      Start Audio Tour
                    </button>
                  </SimpleTooltip>
                )}
              </div>
            </div>
            <div className="text-right flex flex-col items-center md:items-end">
              <div className="text-sm text-blue-200 mb-1">Team Size</div>
              <SimpleTooltip content="Total project team members">
                <div className="text-4xl font-bold text-white flex items-center gap-2 animate-bounce cursor-default">
                  <Users className="w-10 h-10" />2 Students
                </div>
              </SimpleTooltip>
              <div className="text-sm text-blue-200 mt-2">November 2025</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-2xl mb-8 p-2">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <SimpleTooltip key={tab.id} content={tab.desc}>
                  <button
                    onClick={() => !isTourActive && setActiveTab(tab.id)}
                    disabled={isTourActive}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap transform ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl scale-105'
                        : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
                    } ${isTourActive ? 'cursor-not-allowed opacity-80' : 'hover:scale-105'}`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                </SimpleTooltip>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className={`bg-white rounded-2xl shadow-2xl p-8 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {activeTab === 'overview' && <OverviewTab activeTourId={activeTourId} />}
          {activeTab === 'problem' && <ProblemTab activeTourId={activeTourId} />}
          {activeTab === 'architecture' && <ArchitectureTab activeTourId={activeTourId} />}
          {activeTab === 'features' && <FeaturesTab activeTourId={activeTourId} />}
          {activeTab === 'tech' && <TechStackTab activeTourId={activeTourId} />}
          {activeTab === 'metrics' && <MetricsTab activeTourId={activeTourId} />}
        </div>
      </div>

      {/* Floating Tour Controls - Subtitle Style */}
      {isTourActive && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] w-[95%] max-w-4xl animate-in slide-in-from-bottom-10 fade-in duration-500">
          
          {/* Settings Panel - Slides up */}
          {showSettings && (
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-t-2xl shadow-2xl border-x border-t border-white/10 p-4 mb-[-1px] animate-in slide-in-from-bottom-2 fade-in">
              <div className="grid md:grid-cols-2 gap-4">
                <SimpleTooltip content="Choose your preferred AI narrator" className="w-full">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Voice</label>
                    <select 
                      value={selectedVoiceName}
                      onChange={(e) => setSelectedVoiceName(e.target.value)}
                      className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {voices.map(v => (
                        <option key={v.name} value={v.name}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                </SimpleTooltip>
                
                <SimpleTooltip content="Adjust narration playback speed" className="w-full">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block flex justify-between">
                      <span>Speed</span>
                      <span>{speechRate}x</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">0.5x</span>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="2" 
                        step="0.25" 
                        value={speechRate}
                        onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                        className="flex-1 accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xs text-gray-400">2x</span>
                    </div>
                  </div>
                </SimpleTooltip>
              </div>
            </div>
          )}

          {/* Main Control Bar */}
          <div className={`bg-slate-900/95 backdrop-blur-xl shadow-2xl border border-white/10 p-6 flex flex-col md:flex-row items-center gap-6 transition-all duration-300 ${showSettings ? 'rounded-b-2xl rounded-t-none border-t-0' : 'rounded-2xl'}`}>
            
            <div className="flex-1 text-center md:text-left min-w-0">
               <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Live Audio Guide</p>
               </div>
               <h3 className="hidden md:block text-xl font-bold text-white mb-2">{currentStep.title}</h3>
               <p className="text-lg md:text-xl text-gray-200 font-medium leading-relaxed">
                 "{currentStep.text}"
               </p>
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0">
               <SimpleTooltip content="Configure voice and speed settings">
                 <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-3 rounded-lg transition-colors ${showSettings ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                >
                  <Settings className="w-5 h-5" />
                </button>
               </SimpleTooltip>

               <SimpleTooltip content="Stop the audio tour">
                 <button 
                  onClick={stopTour}
                  className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-sm font-medium"
                >
                  End Tour
                </button>
               </SimpleTooltip>
               
               <SimpleTooltip content="Skip to the next section">
                <button 
                  onClick={nextStep}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95"
                >
                  Next <SkipForward className="w-4 h-4 fill-current" />
                </button>
               </SimpleTooltip>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper for highlighting styles
const getHighlightClass = (id: string, activeId: string | null) => {
  return activeId === id 
    ? "relative z-50 ring-4 ring-yellow-400 scale-[1.02] bg-white transition-all duration-500 shadow-2xl" 
    : "";
};

const OverviewTab = ({ activeTourId }: { activeTourId: string | null }) => (
  <div className="space-y-6">
    <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
      Project Overview
    </h2>
    
    {/* Project Objective */}
    <div 
      id="tour-objective"
      className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 border-blue-600 hover:shadow-xl transition-all duration-300 transform ${getHighlightClass('tour-objective', activeTourId)}`}
    >
      {activeTourId === 'tour-objective' && <TourActiveLabel activeId="tour-objective" />}
      <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
        <Target className="w-7 h-7 text-blue-600 animate-pulse" />
        Project Objective
      </h3>
      <p className="text-lg text-gray-700 leading-relaxed">
        Build a <strong>Retrieval-Augmented Generation (RAG) chatbot</strong> that can answer domain-specific 
        questions by retrieving information from a custom knowledge base, demonstrating practical understanding 
        of vector databases, embeddings, and LLM integration.
      </p>
    </div>

    {/* Business Context */}
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-l-4 border-green-600 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
      <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
        <Globe className="w-7 h-7 text-green-600" />
        Business Context
      </h3>
      <p className="text-lg text-gray-700 leading-relaxed">
        Simulate a real-world scenario where a company needs an intelligent Q&A system for internal 
        documentation, customer support, or educational content. This system eliminates the need for 
        manual document searching and provides instant, accurate answers grounded in actual documents.
      </p>
    </div>

    {/* Key Stats Grid with Animated Numbers */}
    <div 
      id="tour-stats"
      className={`grid md:grid-cols-4 gap-6 mt-8 p-2 rounded-xl ${getHighlightClass('tour-stats', activeTourId)}`}
    >
      {activeTourId === 'tour-stats' && <TourActiveLabel activeId="tour-stats" />}
      
      <SimpleTooltip content="Number of major features implemented">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:scale-105 transform transition-all duration-300 shadow-xl hover:shadow-2xl">
          <div className="text-5xl font-bold mb-2">8</div>
          <div className="text-blue-100">Core Features</div>
        </div>
      </SimpleTooltip>

      <SimpleTooltip content="Supported document input types">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white hover:scale-105 transform transition-all duration-300 shadow-xl hover:shadow-2xl">
          <div className="text-5xl font-bold mb-2">3</div>
          <div className="text-green-100">File Formats</div>
        </div>
      </SimpleTooltip>

      <SimpleTooltip content="Average time to process query">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:scale-105 transform transition-all duration-300 shadow-xl hover:shadow-2xl">
          <div className="text-5xl font-bold mb-2">1-2s</div>
          <div className="text-purple-100">Response Time</div>
        </div>
      </SimpleTooltip>

      <SimpleTooltip content="Total project codebase size">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white hover:scale-105 transform transition-all duration-300 shadow-xl hover:shadow-2xl">
          <div className="text-5xl font-bold mb-2">~1500</div>
          <div className="text-orange-100">Lines of Code</div>
        </div>
      </SimpleTooltip>
    </div>

    {/* What We Built */}
    <div className="mt-8">
      <h3 className="text-3xl font-bold text-gray-900 mb-4">What We Built</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { icon: BookOpen, title: 'Document Analyzer', desc: 'Processes PDF, DOCX, TXT files', color: 'blue' },
          { icon: MessageSquare, title: 'Q&A Chatbot', desc: 'Context-aware conversational AI', color: 'green' },
          { icon: Brain, title: 'Learning Assistant', desc: 'Quizzes, flashcards, mind maps', color: 'purple' },
          { icon: Zap, title: 'Smart Summarizer', desc: 'Auto-generates insights & summaries', color: 'orange' }
        ].map((item, idx) => (
          <SimpleTooltip key={idx} content={`Feature: ${item.desc}`}>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl w-full">
              <div className="bg-blue-500 p-3 rounded-lg hover:rotate-12 transition-transform duration-300">
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            </div>
          </SimpleTooltip>
        ))}
      </div>
    </div>
  </div>
);

const ProblemTab = ({ activeTourId }: { activeTourId: string | null }) => (
  <div className="space-y-8">
    <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-6">
      Problem Statement & Solution
    </h2>
    
    {/* Problem Statement */}
    <div 
      id="tour-problem" 
      className={`p-4 rounded-xl ${getHighlightClass('tour-problem', activeTourId)}`}
    >
      {activeTourId === 'tour-problem' && <TourActiveLabel activeId="tour-problem" />}
      <h3 className="text-3xl font-bold text-red-600 mb-4 flex items-center gap-3">
        <AlertCircle className="w-8 h-8 animate-pulse" />
        The Challenge
      </h3>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { icon: '📄', title: 'Manual Processing', desc: 'Handling large document volumes manually is time-consuming and error-prone' },
          { icon: '❌', title: 'Information Overload', desc: 'Extracting key insights from hundreds of pages is difficult' },
          { icon: '🔍', title: 'Slow Search', desc: 'Users need quick, accurate answers but traditional search is inadequate' },
          { icon: '📚', title: 'Scattered Knowledge', desc: 'Learning materials and documentation are unorganized across multiple sources' },
          { icon: '⏱️', title: 'No AI Analysis', desc: 'Traditional methods lack intelligent analysis and contextual understanding' },
          { icon: '💰', title: 'High Costs', desc: 'Enterprise solutions are expensive and require subscriptions' }
        ].map((item, idx) => (
          <div key={idx} className="bg-red-50 rounded-xl p-5 border-l-4 border-red-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-4xl mb-2">{item.icon}</div>
            <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
            <p className="text-gray-700 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Solution with Animations */}
    <div>
      <h3 className="text-3xl font-bold text-green-600 mb-4 flex items-center gap-3">
        <CheckCircle className="w-8 h-8" />
        Our Solution: RAG System
      </h3>
      <div className="space-y-4">
        {[
          { icon: '✅', title: 'Upload Documents', desc: 'Supports PDF, DOCX, TXT with fast PyMuPDF extraction' },
          { icon: '🤖', title: 'AI Analysis', desc: 'GROQ-powered LLM analyzes and extracts insights automatically' },
          { icon: '💬', title: 'Instant Answers', desc: 'Get accurate, grounded responses with source citations' },
          { icon: '📖', title: 'Learning Tools', desc: 'Auto-generate quizzes, flashcards, mind maps, and summaries' },
          { icon: '🎨', title: 'User-Friendly UI', desc: 'Clean Streamlit interface with dark/light mode support' },
          { icon: '🆓', title: 'Cost-Effective', desc: 'Open source, self-hosted, free GROQ tier available' }
        ].map((item, idx) => (
          <div key={idx} className="bg-green-50 rounded-xl p-5 border-l-4 border-green-500 flex items-start gap-4 hover:shadow-xl transition-all duration-300 transform hover:translate-x-2">
            <div className="text-4xl">{item.icon}</div>
            <div>
              <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
              <p className="text-gray-700">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Value Proposition with Glow Effect */}
    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white shadow-2xl transition-all duration-300">
      <h3 className="text-3xl font-bold mb-4">Value Proposition</h3>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="text-center transform hover:scale-110 transition-transform duration-300">
          <div className="text-6xl font-bold mb-2">10x</div>
          <div className="text-blue-100">Faster than manual search</div>
        </div>
        <div className="text-center transform hover:scale-110 transition-transform duration-300">
          <div className="text-6xl font-bold mb-2">$0</div>
          <div className="text-blue-100">Cost with free tier</div>
        </div>
        <div className="text-center transform hover:scale-110 transition-transform duration-300">
          <div className="text-6xl font-bold mb-2">100%</div>
          <div className="text-blue-100">Grounded answers</div>
        </div>
      </div>
    </div>
  </div>
);

const ArchitectureTab = ({ activeTourId }: { activeTourId: string | null }) => (
  <div className="space-y-6">
    <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
      System Architecture
    </h2>
    
    {/* Architecture Flow with Animations */}
    <div 
      id="tour-architecture"
      className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border-2 border-gray-300 shadow-xl ${getHighlightClass('tour-architecture', activeTourId)}`}
    >
      {activeTourId === 'tour-architecture' && <TourActiveLabel activeId="tour-architecture" />}
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-bold text-xl shadow-lg">
            USER UPLOADS DOCUMENT
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="text-5xl text-blue-600">↓</div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-purple-300 transform hover:scale-105 transition-all duration-300">
            <h4 className="font-bold text-purple-600 mb-3 text-lg">1. EXTRACTION</h4>
            <ul className="text-sm space-y-2 text-gray-700">
              <li className="flex items-center gap-2"><span className="text-purple-600">•</span> PyMuPDF extracts text</li>
              <li className="flex items-center gap-2"><span className="text-purple-600">•</span> Text cleaning</li>
              <li className="flex items-center gap-2"><span className="text-purple-600">•</span> Format detection</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-green-300 transform hover:scale-105 transition-all duration-300">
            <h4 className="font-bold text-green-600 mb-3 text-lg">2. CHUNKING</h4>
            <ul className="text-sm space-y-2 text-gray-700">
              <li className="flex items-center gap-2"><span className="text-green-600">•</span> 1000-char chunks</li>
              <li className="flex items-center gap-2"><span className="text-green-600">•</span> 200-char overlap</li>
              <li className="flex items-center gap-2"><span className="text-green-600">•</span> Metadata tagging</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-blue-300 transform hover:scale-105 transition-all duration-300">
            <h4 className="font-bold text-blue-600 mb-3 text-lg">3. VECTORIZATION</h4>
            <ul className="text-sm space-y-2 text-gray-700">
              <li className="flex items-center gap-2"><span className="text-blue-600">•</span> TF-IDF vectors</li>
              <li className="flex items-center gap-2"><span className="text-blue-600">•</span> Cosine similarity</li>
              <li className="flex items-center gap-2"><span className="text-blue-600">•</span> Cache in memory</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="text-5xl text-green-600">↓</div>
        </div>
        
        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-lg font-bold text-xl shadow-lg">
            READY FOR QUERIES
          </div>
        </div>
      </div>
    </div>

    {/* Components with Hover Effects */}
    <div className="grid md:grid-cols-3 gap-6 mt-8">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
        <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
          <Database className="w-6 h-6" />
          Backend (RAG Engine)
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <span>Document processing pipeline</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <span>Vector database (TF-IDF)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <span>LLM integration (GROQ)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <span>Retrieval algorithms</span>
          </li>
        </ul>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
        <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
          <Code className="w-6 h-6" />
          Frontend (Streamlit)
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Document upload interface</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Real-time chat UI</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Learning tools panel</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <span>Dashboard with metrics</span>
          </li>
        </ul>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
        <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          Utilities (utils.py)
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <span>PDF extraction (PyMuPDF)</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <span>Text cleaning pipeline</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <span>Sentence extraction</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <span>Keyword identification</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
);

const FeaturesTab = ({ activeTourId }: { activeTourId: string | null }) => {
  const features = [
    { icon: '📋', title: 'Document Summary', desc: 'Auto-generates 2-3 paragraph summaries in under 2 seconds', color: 'bg-blue-50 border-blue-500' },
    { icon: '💡', title: 'Key Insights', desc: 'Extracts 5 major insights ranked by importance', color: 'bg-green-50 border-green-500' },
    { icon: '📑', title: 'Table of Contents', desc: 'Auto-generates 5-8 sections mapping document structure', color: 'bg-purple-50 border-purple-500' },
    { icon: '🧠', title: 'Mind Map Generator', desc: '3-4 level hierarchical visualization with 8-12 nodes', color: 'bg-orange-50 border-orange-500' },
    { icon: '❓', title: 'Smart Quiz', desc: 'Generates 3-10 MCQs with instant feedback and explanations', color: 'bg-red-50 border-red-500' },
    { icon: '📇', title: 'Flashcards', desc: 'Creates 5-20 cards in grid layout for quick review', color: 'bg-indigo-50 border-indigo-500' },
    { icon: '💬', title: 'Document Chat', desc: 'Context-aware Q&A with source citations', color: 'bg-teal-50 border-teal-500' },
    { icon: '🎤', title: 'Audio Summary', desc: 'Text-to-speech MP3 generation (2-3 minutes)', color: 'bg-pink-50 border-pink-500' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-6">
        Core Features
      </h2>
      
      <div 
        id="tour-features"
        className={`grid md:grid-cols-2 gap-6 p-4 rounded-xl ${getHighlightClass('tour-features', activeTourId)}`}
      >
        {activeTourId === 'tour-features' && <TourActiveLabel activeId="tour-features" />}
        {features.map((feature, idx) => (
          <SimpleTooltip key={idx} content={feature.desc}>
            <div className={`${feature.color} rounded-xl p-6 border-l-4 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 w-full`}>
              <div className="flex items-start gap-4">
                <div className="text-5xl">{feature.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-700">{feature.desc}</p>
                </div>
              </div>
            </div>
          </SimpleTooltip>
        ))}
      </div>

      {/* Feature Comparison */}
      <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-300 overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h3 className="text-2xl font-bold text-white">Feature Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200 border-b-2 border-gray-400">
                <th className="text-left p-4 font-bold">Feature</th>
                <th className="text-left p-4 font-bold">Our System</th>
                <th className="text-left p-4 font-bold">ChatGPT</th>
                <th className="text-left p-4 font-bold">Google Docs AI</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-gray-200 hover:bg-blue-50 transition-colors">
                <td className="p-4 font-medium">Document Grounding</td>
                <td className="p-4 text-green-600 font-bold text-lg">✓ Yes</td>
                <td className="p-4 text-red-600 font-bold">✗ No</td>
                <td className="p-4 text-green-600 font-bold">✓ Yes</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-green-50 transition-colors">
                <td className="p-4 font-medium">Learning Tools</td>
                <td className="p-4 text-green-600 font-bold text-lg">✓ 6 Tools</td>
                <td className="p-4 text-red-600 font-bold">✗ Limited</td>
                <td className="p-4 text-red-600 font-bold">✗ No</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-purple-50 transition-colors">
                <td className="p-4 font-medium">Open Source</td>
                <td className="p-4 text-green-600 font-bold text-lg">✓ Yes</td>
                <td className="p-4 text-red-600 font-bold">✗ No</td>
                <td className="p-4 text-red-600 font-bold">✗ No</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-orange-50 transition-colors">
                <td className="p-4 font-medium">Cost</td>
                <td className="p-4 text-green-600 font-bold text-lg">Free</td>
                <td className="p-4 text-orange-600 font-bold">$20/mo</td>
                <td className="p-4 text-orange-600 font-bold">$10/mo</td>
              </tr>
              <tr className="hover:bg-blue-50 transition-colors">
                <td className="p-4 font-medium">Response Time</td>
                <td className="p-4 text-green-600 font-bold text-lg">1-2s</td>
                <td className="p-4 text-gray-600 font-bold">2-3s</td>
                <td className="p-4 text-gray-600 font-bold">3-5s</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TechStackTab = ({ activeTourId }: { activeTourId: string | null }) => (
  <div className="space-y-6">
    <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-6">
      Technology Stack
    </h2>
    
    <div 
      id="tour-tech"
      className={`grid md:grid-cols-2 gap-6 p-4 rounded-xl ${getHighlightClass('tour-tech', activeTourId)}`}
    >
      {activeTourId === 'tour-tech' && <TourActiveLabel activeId="tour-tech" />}
      {/* Languages & Frameworks */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-300 hover:shadow-2xl transition-all duration-300">
        <h3 className="text-xl font-bold text-blue-900 mb-4">Languages & Frameworks</h3>
        <div className="space-y-3">
          {[
            { name: 'Python 3.8+', purpose: 'Core programming language', version: '3.8+' },
            { name: 'Streamlit', purpose: 'Web UI framework', version: '1.32.0' },
            { name: 'GROQ API', purpose: 'Fast LLM inference', version: '0.34.1' }
          ].map((tech, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 hover:scale-105 transition-transform duration-300">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-900">{tech.name}</span>
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">{tech.version}</span>
              </div>
              <p className="text-sm text-gray-600">{tech.purpose}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ML & Data Processing */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-300 hover:shadow-2xl transition-all duration-300">
        <h3 className="text-xl font-bold text-green-900 mb-4">ML & Data Processing</h3>
        <div className="space-y-3">
          {[
            { name: 'scikit-learn', purpose: 'TF-IDF & ML algorithms', version: '1.3.2' },
            { name: 'NumPy', purpose: 'Numerical computing', version: '1.24.3' },
            { name: 'PyMuPDF', purpose: 'Fast PDF extraction', version: '1.23.8' }
          ].map((tech, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 hover:scale-105 transition-transform duration-300">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-gray-900">{tech.name}</span>
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">{tech.version}</span>
              </div>
              <p className="text-sm text-gray-600">{tech.purpose}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Model Information */}
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300">
      <h3 className="text-2xl font-bold mb-6">AI Models</h3>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="font-bold text-lg mb-3">Language Model</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>llama-3.3-70b-versatile</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>70B parameters</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>8192 token context</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>300+ tokens/sec</span>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-3">Vectorization</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>TF-IDF (scikit-learn)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Cosine similarity</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>O(n) complexity</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>In-memory caching</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    {/* Why Each Technology */}
    <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Technology Decisions</h3>
      <div className="space-y-4">
        {[
          { tech: 'Streamlit', why: 'Rapid UI development, Python-native, no frontend expertise needed', alt: 'Flask, Django' },
          { tech: 'GROQ', why: 'Ultra-fast LLM inference (300+ tokens/sec), cost-effective, privacy-focused', alt: 'OpenAI, Claude' },
          { tech: 'PyMuPDF', why: '3-5x faster than alternatives, robust PDF parsing', alt: 'PyPDF2, pdfplumber' },
          { tech: 'scikit-learn', why: 'Industry-standard ML toolkit, lightweight, well-documented', alt: 'TensorFlow, PyTorch' },
          { tech: 'TF-IDF', why: 'Fast, interpretable, no GPU required, works offline', alt: 'Sentence transformers' }
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-lg p-4 border-l-4 border-blue-400 hover:shadow-lg transition-all duration-300 transform hover:translate-x-2">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-gray-900">{item.tech}</h4>
              <span className="text-xs text-gray-500">Alt: {item.alt}</span>
            </div>
            <p className="text-gray-700 text-sm">{item.why}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const MetricsTab = ({ activeTourId }: { activeTourId: string | null }) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6">
        Performance Metrics & Visualizations
      </h2>
      
      {/* Performance Benchmarks with Animated Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <SimpleTooltip content="Total time including LLM generation">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-2xl hover:scale-105 transition-all duration-300 cursor-default">
            <Clock className="w-12 h-12 mb-4 animate-pulse" />
            <div className="text-6xl font-bold mb-2">1-2s</div>
            <div className="text-green-100 text-lg">Query Response Time</div>
            <div className="mt-4 text-sm text-green-100">Including LLM inference</div>
          </div>
        </SimpleTooltip>

        <SimpleTooltip content="Time to ingest and process new files">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-2xl hover:scale-105 transition-all duration-300 cursor-default">
            <Cpu className="w-12 h-12 mb-4 animate-pulse" />
            <div className="text-6xl font-bold mb-2">&lt;5s</div>
            <div className="text-blue-100 text-lg">Document Processing</div>
            <div className="mt-4 text-sm text-blue-100">Full pipeline end-to-end</div>
          </div>
        </SimpleTooltip>

        <SimpleTooltip content="Time to find relevant context chunks">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-2xl hover:scale-105 transition-all duration-300 cursor-default">
            <Activity className="w-12 h-12 mb-4 animate-pulse" />
            <div className="text-6xl font-bold mb-2">100ms</div>
            <div className="text-purple-100 text-lg">Retrieval Speed</div>
            <div className="mt-4 text-sm text-purple-100">Cosine similarity search</div>
          </div>
        </SimpleTooltip>
      </div>

      {/* Performance Visualization - Bar Chart */}
      <div 
        id="tour-metrics"
        className={`bg-white rounded-xl border-2 border-gray-200 p-6 shadow-xl ${getHighlightClass('tour-metrics', activeTourId)}`}
      >
        {activeTourId === 'tour-metrics' && <TourActiveLabel activeId="tour-metrics" />}
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-blue-600" />
          Operation Performance (milliseconds)
        </h3>
        <div className="space-y-4">
          {[
            { name: 'PDF Extraction (10 pages)', time: 1000, color: 'bg-blue-500', maxTime: 5000 },
            { name: 'Text Chunking', time: 500, color: 'bg-green-500', maxTime: 5000 },
            { name: 'Vector Creation', time: 200, color: 'bg-purple-500', maxTime: 5000 },
            { name: 'Query Retrieval', time: 100, color: 'bg-orange-500', maxTime: 5000 },
            { name: 'LLM Response', time: 2500, color: 'bg-red-500', maxTime: 5000 },
            { name: 'Summary Generation', time: 2000, color: 'bg-indigo-500', maxTime: 5000 },
            { name: 'Quiz Generation', time: 4000, color: 'bg-pink-500', maxTime: 5000 },
            { name: 'Mind Map Creation', time: 2500, color: 'bg-teal-500', maxTime: 5000 }
          ].map((item, idx) => (
            <SimpleTooltip key={idx} content={`Execution time: ${item.time}ms`} className="w-full">
              <div 
                onMouseEnter={() => setHoveredBar(idx)}
                onMouseLeave={() => setHoveredBar(null)}
                className="relative w-full"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                  <span className="text-sm font-bold text-gray-900">{item.time}ms</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div 
                    className={`${item.color} h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-3 text-white font-bold text-xs shadow-lg`}
                    style={{ 
                      width: hoveredBar === idx ? `${(item.time / item.maxTime) * 100}%` : '0%',
                      transition: 'width 1s ease-out'
                    }}
                  >
                    {hoveredBar === idx && `${item.time}ms`}
                  </div>
                </div>
              </div>
            </SimpleTooltip>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-4 italic">*Hover over bars to see animated performance metrics</p>
      </div>

      {/* Detailed Benchmarks Table */}
      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h3 className="text-2xl font-bold text-white">Detailed Operation Benchmarks</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="text-left p-4 font-bold">Operation</th>
                <th className="text-left p-4 font-bold">Time</th>
                <th className="text-left p-4 font-bold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {[
                { op: 'PDF Extraction (10 pages)', time: '~1s', note: 'PyMuPDF processing', color: 'hover:bg-blue-50' },
                { op: 'Text Chunking', time: '~500ms', note: '1000-char chunks with overlap', color: 'hover:bg-green-50' },
                { op: 'Vector Creation', time: '~200ms', note: 'TF-IDF vectorization', color: 'hover:bg-purple-50' },
                { op: 'Query Retrieval', time: '~100ms', note: 'Top-5 chunks via cosine similarity', color: 'hover:bg-orange-50' },
                { op: 'LLM Response', time: '~2-3s', note: 'GROQ API call + generation', color: 'hover:bg-red-50' },
                { op: 'Summary Generation', time: '~2s', note: 'Full document summary', color: 'hover:bg-indigo-50' },
                { op: 'Quiz Generation (5 Qs)', time: '~3-5s', note: 'MCQ with explanations', color: 'hover:bg-pink-50' },
                { op: 'Mind Map Creation', time: '~2-3s', note: 'Hierarchical structure', color: 'hover:bg-teal-50' }
              ].map((row, idx) => (
                <tr key={idx} className={`border-b border-gray-100 ${row.color} transition-colors duration-200`}>
                  <td className="p-4 font-medium">{row.op}</td>
                  <td className="p-4 text-blue-600 font-bold text-lg">{row.time}</td>
                  <td className="p-4 text-gray-600 text-sm">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code & System Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-300 hover:shadow-2xl transition-all duration-300">
          <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
            <Code className="w-6 h-6" />
            Code Statistics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg hover:scale-105 transition-transform">
              <span className="text-gray-700">Total Lines of Code</span>
              <span className="font-bold text-orange-600 text-2xl">~1,500</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg hover:scale-105 transition-transform">
              <span className="text-gray-700">Python Files</span>
              <span className="font-bold text-orange-600 text-2xl">3</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg hover:scale-105 transition-transform">
              <span className="text-gray-700">Classes</span>
              <span className="font-bold text-orange-600 text-2xl">4</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg hover:scale-105 transition-transform">
              <span className="text-gray-700">Functions/Methods</span>
              <span className="font-bold text-orange-600 text-2xl">20+</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 border-2 border-teal-300 hover:shadow-2xl transition-all duration-300">
          <h3 className="text-xl font-bold text-teal-900 mb-4 flex items-center gap-2">
            <HardDrive className="w-6 h-6" />
            System Capabilities
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg hover:scale-105 transition-transform">
              <span className="text-gray-700">Supported Formats</span>
              <span className="font-bold text-teal-600 text-2xl">3</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg hover:scale-105 transition-transform">
              <span className="text-gray-700">Max Document Size</span>
              <span className="font-bold text-teal-600 text-xl">Unlimited</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg hover:scale-105 transition-transform">
              <span className="text-gray-700">Concurrent Users</span>
              <span className="font-bold text-teal-600 text-2xl">Single</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white rounded-lg hover:scale-105 transition-transform">
              <span className="text-gray-700">Storage Type</span>
              <span className="font-bold text-teal-600 text-xl">In-Memory</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Optimizations */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-l-4 border-indigo-600 shadow-lg">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Performance Optimizations</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: '⚡', title: 'Fast PDFs', desc: 'PyMuPDF is 3-5x faster than PyPDF2' },
            { icon: '📊', title: 'Smart Chunking', desc: '1000-char chunks with 200-char overlap for context' },
            { icon: '🎯', title: 'Fast Retrieval', desc: 'O(n) cosine similarity, sub-100ms queries' },
            { icon: '💾', title: 'Caching', desc: 'TF-IDF matrix cached in memory after first build' },
            { icon: '🚀', title: 'Batch Processing', desc: 'Multiple documents processed efficiently' },
            { icon: '🔧', title: 'Minimal Dependencies', desc: 'Lightweight stack, ~500MB total size' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-3xl">{item.icon}</div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scalability Metrics with Glow Effect */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 text-white shadow-2xl hover:shadow-blue-500/50 transition-all duration-300">
        <h3 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 animate-pulse" />
          Scalability Analysis
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 hover:scale-110 transition-transform duration-300">
            <div className="text-gray-400 text-sm mb-2">Single Document</div>
            <div className="text-5xl font-bold mb-2">100K+</div>
            <div className="text-gray-300">pages supported</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 hover:scale-110 transition-transform duration-300">
            <div className="text-gray-400 text-sm mb-2">Memory Usage</div>
            <div className="text-5xl font-bold mb-2">2-4GB</div>
            <div className="text-gray-300">typical RAM</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 hover:scale-110 transition-transform duration-300">
            <div className="text-gray-400 text-sm mb-2">Query Throughput</div>
            <div className="text-5xl font-bold mb-2">30+</div>
            <div className="text-gray-300">queries/minute</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RAGProjectDashboard;