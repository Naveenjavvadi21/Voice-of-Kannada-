import React, { useState, useEffect } from 'react';
import { Volume2, Star, Search, MapPin } from 'lucide-react';
import type { PhraseItem, RegionalDialectItem } from '../types';
import { fetchPhrases, fetchDialects } from '../services/api';
import { speechService } from '../services/speechSynthesis';
import { toggleFavorite } from '../services/storage';
import { WordTappable } from '../components/WordTappable';

interface PhrasebookViewProps {
  favoriteIds: string[];
  onFavoritesChanged: (ids: string[]) => void;
}

export const PhrasebookView: React.FC<PhrasebookViewProps> = ({
  favoriteIds,
  onFavoritesChanged
}) => {
  const [activeTab, setActiveTab] = useState<'phrasebook' | 'dialects'>('phrasebook');
  const [phrases, setPhrases] = useState<PhraseItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [dialects, setDialects] = useState<RegionalDialectItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const pData = await fetchPhrases();
      setPhrases(pData.phrases);
      setCategories(pData.categories);

      const dData = await fetchDialects();
      setDialects(dData);
    };
    load();
  }, []);

  const handleFavoriteToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = toggleFavorite(id);
    onFavoritesChanged(updated.favoritePhraseIds);
  };

  // Filter phrases
  const filteredPhrases = phrases.filter((p) => {
    if (onlyFavorites && !favoriteIds.includes(p.id)) return false;
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchK = p.kannada_script.toLowerCase().includes(q);
      const matchT = p.transliteration.toLowerCase().includes(q);
      const matchE = p.english.toLowerCase().includes(q);
      return matchK || matchT || matchE;
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 pb-28">
      {/* Top Selector: Survival Phrasebook vs Regional Flavors */}
      <div className="flex bg-amber-100/70 p-1 rounded-2xl mb-4 border border-amber-300/50">
        <button
          onClick={() => setActiveTab('phrasebook')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'phrasebook'
              ? 'bg-[#9B111E] text-amber-300 shadow'
              : 'text-amber-950 hover:bg-amber-200/50'
          }`}
        >
          <span>📖 Survival Phrasebook (40+ Phrases)</span>
        </button>
        <button
          onClick={() => setActiveTab('dialects')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'dialects'
              ? 'bg-[#9B111E] text-amber-300 shadow'
              : 'text-amber-950 hover:bg-amber-200/50'
          }`}
        >
          <span>🗺️ Regional Dialects (ಕರ್ನಾಟಕದ ಸೊಗಡು)</span>
        </button>
      </div>

      {activeTab === 'phrasebook' ? (
        <>
          {/* Search & Favorites Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5 mb-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Kannada, transliteration, or English (e.g., 'water', 'meter', 'oota')"
                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-700/40"
              />
            </div>
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded-2xl text-xs font-bold border transition ${
                onlyFavorites
                  ? 'bg-amber-400 text-red-950 border-amber-500 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-red-950' : ''}`} />
              <span>Favorites ({favoriteIds.length})</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-[#9B111E] text-amber-300 shadow-xs'
                    : 'bg-white hover:bg-amber-50 text-slate-600 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Phrases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredPhrases.map((phrase) => {
              const isFav = favoriteIds.includes(phrase.id);
              return (
                <div
                  key={phrase.id}
                  className="bg-white rounded-2xl p-4 border border-amber-200/70 hover:border-amber-400 hover:shadow-md transition relative group"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {phrase.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => handleFavoriteToggle(phrase.id, e)}
                        className="p-1 text-slate-300 hover:text-amber-500 transition"
                        title={isFav ? 'Remove favorite' : 'Add to favorites'}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'text-amber-500 fill-amber-500' : ''}`} />
                      </button>
                      <button
                        onClick={() => speechService.speak(phrase.kannada_script, { rate: 0.85 })}
                        className="p-1 text-red-800 hover:text-red-950 transition"
                        title="Listen in Kannada"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-1 text-lg font-bold text-slate-900 leading-snug">
                    <WordTappable kannadaText={phrase.kannada_script} />
                  </div>

                  <div className="text-xs font-semibold text-amber-900 italic mt-1">
                    {phrase.transliteration}
                  </div>

                  <div className="text-xs text-slate-600 mt-1">
                    {phrase.english}
                  </div>

                  {phrase.context_note && (
                    <div className="mt-2 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-start space-x-1.5">
                      <span className="text-amber-600 font-bold shrink-0">💡 Note:</span>
                      <span>{phrase.context_note}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredPhrases.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              No matching phrases found for "{searchQuery}".
            </div>
          )}
        </>
      ) : (
        /* Regional Dialects / Flavors Tab (FR-7) */
        <div className="space-y-4">
          <div className="bg-amber-50/80 border border-amber-300/80 rounded-2xl p-3.5 text-xs text-amber-950">
            <span className="font-bold flex items-center gap-1.5 text-red-900 mb-1">
              <MapPin className="w-4 h-4" />
              <span>The Beautiful Diversity of Kannada Dialects</span>
            </span>
            <p className="leading-relaxed">
              While standard Kannada is understood across Karnataka, each region has its unique musical cadence:
              <strong> Bengaluru</strong> blends brisk urban terms, <strong>Mysuru</strong> carries royal politeness with "Ree",
              <strong> Uttara Karnataka</strong> brings earthy rhythmic warmth like "Aram adeerenri", and <strong>Karavali (Coastal)</strong> weaves Tuluva cadence.
            </p>
          </div>

          <div className="space-y-4">
            {dialects.map((item, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-5 border border-amber-200/80 shadow-xs">
                {/* Standard Baseline */}
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Standard Kannada Phrase</span>
                    <div className="text-xl font-bold text-slate-900 mt-0.5">{item.standard_phrase}</div>
                    <div className="text-xs text-amber-900 italic">{item.standard_transliteration} • {item.english}</div>
                  </div>
                  <button
                    onClick={() => speechService.speak(item.standard_phrase, { rate: 0.85 })}
                    className="p-2 text-red-900 hover:bg-amber-50 rounded-xl transition"
                    title="Play standard phrase"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Regional Variations Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                  {item.variants.map((v, vIdx) => (
                    <div
                      key={vIdx}
                      className="bg-[#FBF9F5] rounded-2xl p-3 border border-slate-200/80 hover:border-amber-400 transition"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-red-900 mb-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-600" />
                          <span>{v.region}</span>
                        </span>
                        <button
                          onClick={() => speechService.speak(v.phrase_kannada, { rate: 0.85 })}
                          className="text-slate-400 hover:text-red-900 p-0.5"
                          title="Play regional dialect"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-sm font-bold text-slate-900">{v.phrase_kannada}</div>
                      <div className="text-[11px] text-amber-900 italic mt-0.5">{v.phrase_transliteration}</div>
                      <div className="text-[11px] text-slate-500 mt-1 leading-snug">{v.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
