import { useRef, useEffect, useState } from 'react';
import { type Language, type LanguageConfig, LANGUAGES } from '../utils/translations';

interface LanguagePickerProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export function LanguagePicker({ currentLanguage, onLanguageChange }: LanguagePickerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(
    LANGUAGES.findIndex((lang: LanguageConfig) => lang.code === currentLanguage)
  );

  const currentLangConfig =
    LANGUAGES.find((lang: LanguageConfig) => lang.code === currentLanguage) || LANGUAGES[0];
  const ITEM_HEIGHT = 50;

  useEffect(() => {
    const currentIndex = LANGUAGES.findIndex((lang: LanguageConfig) => lang.code === currentLanguage);
    if (currentIndex !== -1 && currentIndex !== selectedIndex) {
      setSelectedIndex(currentIndex);
      if (isOpen) {
        scrollToIndex(currentIndex, false);
      }
    }
  }, [currentLanguage, isOpen, selectedIndex]);

  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollToIndex(selectedIndex, false);
    }
  }, [isOpen, selectedIndex]);

  const scrollToIndex = (index: number, smooth: boolean = true) => {
    if (scrollContainerRef.current) {
      const scrollTop = index * ITEM_HEIGHT;
      scrollContainerRef.current.scrollTo({
        top: scrollTop,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollTop = scrollContainerRef.current.scrollTop;
      const index = Math.round(scrollTop / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(LANGUAGES.length - 1, index));
      
      if (clampedIndex !== selectedIndex) {
        setSelectedIndex(clampedIndex);
      }
    }
  };

  const handleLanguageClick = (index: number) => {
    setSelectedIndex(index);
    onLanguageChange(LANGUAGES[index].code);
    scrollToIndex(index);
    // Close after selection
    setTimeout(() => setIsOpen(false), 300);
  };

  useEffect(() => {
    if (!isOpen) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout: ReturnType<typeof setTimeout> | undefined;
    const handleScrollEnd = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(() => {
        const scrollTop = container.scrollTop;
        const index = Math.round(scrollTop / ITEM_HEIGHT);
        scrollToIndex(index, true);
      }, 150);
    };

    container.addEventListener('scroll', handleScrollEnd);
    return () => {
      container.removeEventListener('scroll', handleScrollEnd);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [isOpen]);

  // Close picker when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target instanceof HTMLElement)) {
        return;
      }
      if (!event.target.closest('.language-picker-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative language-picker-container">
      {/* Collapsed button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-80 h-16 bg-[#E7E0D6] text-[#243B6B] text-[22px] leading-[28px] font-semibold rounded-xl hover:bg-[#ddd5ca] transition-colors flex items-center justify-center gap-2 relative z-50"
        style={{ fontFamily: currentLangConfig.fontFamily }}
      >
        {currentLangConfig.nativeName}
        <svg 
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded picker */}
      {isOpen && (
        <>
          {/* Picker modal - opens UPWARD */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[72px] z-50">
            <div className="relative w-80 h-[280px] bg-[#E7E0D6] rounded-2xl border-2 border-[#243B6B] overflow-hidden shadow-2xl">
              {/* Top gradient mask */}
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#E7E0D6] to-transparent pointer-events-none z-10" />
              
              {/* Bottom gradient mask */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#E7E0D6] to-transparent pointer-events-none z-10" />
              
              {/* Selection highlight */}
              <div 
                className="absolute left-0 right-0 h-[50px] bg-[#243B6B] bg-opacity-10 border-y-2 border-[#243B6B] pointer-events-none z-10"
                style={{ top: `115px` }}
              />

              {/* Scrollable container */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="h-full overflow-y-scroll scrollbar-hide"
                style={{
                  scrollSnapType: 'y mandatory',
                  paddingTop: `${ITEM_HEIGHT * 2.3}px`,
                  paddingBottom: `${ITEM_HEIGHT * 2.3}px`
                }}
              >
                {LANGUAGES.map((lang: LanguageConfig, index: number) => {
                  const distanceFromCenter = Math.abs(index - selectedIndex);
                  const opacity = Math.max(0.25, 1 - distanceFromCenter * 0.3);
                  const scale = Math.max(0.8, 1 - distanceFromCenter * 0.1);
                  
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageClick(index)}
                      className="w-full flex items-center justify-center transition-all duration-200"
                      style={{
                        height: `${ITEM_HEIGHT}px`,
                        scrollSnapAlign: 'center',
                        opacity,
                        transform: `scale(${scale})`,
                        fontFamily: lang.fontFamily
                      }}
                    >
                      <span
                        className={`text-[22px] leading-[30px] font-semibold transition-colors ${
                          index === selectedIndex
                            ? 'text-[#243B6B]'
                            : 'text-[#5A6472]'
                        }`}
                      >
                        {lang.nativeName}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Scroll indicators */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none z-20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-40">
                  <path d="M7 14l5-5 5 5" stroke="#243B6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-40">
                  <path d="M7 10l5 5 5-5" stroke="#243B6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
