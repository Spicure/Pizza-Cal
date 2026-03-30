/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Pizza, Scale, Droplets, Utensils, Zap, Info, RefreshCw, Clock, Thermometer, Snowflake, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import WaterTemperatureCalculator from './components/WaterTemperatureCalculator';
import { t, Language } from './translations';

export default function App() {
  const [lang, setLang] = useState<Language>('fr');
  const txt = t[lang];

  // Inputs
  const [numBalls, setNumBalls] = useState<number>(1);
  const [ballWeight, setBallWeight] = useState<number>(250);
  const [hydration, setHydration] = useState<number>(62.5);
  const [salt, setSalt] = useState<number>(2.5);
  const [oil, setOil] = useState<number>(0);

  // Yeast Inputs
  const [autoYeast, setAutoYeast] = useState<boolean>(true);
  const [yeast, setYeast] = useState<number>(0.15); // Manual yeast
  const [rtTime, setRtTime] = useState<number>(4);
  const [rtTemp, setRtTemp] = useState<number>(21);
  const [ctTime, setCtTime] = useState<number>(24);
  const [ctTemp, setCtTemp] = useState<number>(4);

  // Calculations
  const calculatedYeast = useMemo(() => {
    // Modèle prédictif pour la levure fraîche de boulanger (LFB)
    const mRT = Math.exp(0.08 * (rtTemp - 20)); // Multiplicateur temp ambiante
    const mCT = Math.exp(0.08 * (ctTemp - 20)); // Multiplicateur temp frigo
    const tEq = (rtTime * mRT) + (ctTime * mCT); // Temps équivalent à 20°C
    
    if (tEq <= 0) return 0;
    
    // Formule empirique pour la levure fraîche
    const y = 4.5 / Math.pow(tEq, 1.1);
    return Math.min(Math.max(y, 0.01), 10); // Limiter entre 0.01% et 10%
  }, [rtTime, rtTemp, ctTime, ctTemp]);

  const effectiveYeast = autoYeast ? calculatedYeast : yeast;

  const results = useMemo(() => {
    const totalWeight = numBalls * ballWeight;
    const sumPercentages = 1 + (hydration / 100) + (salt / 100) + (effectiveYeast / 100) + (oil / 100);
    
    const flourG = totalWeight / sumPercentages;
    const waterG = flourG * (hydration / 100);
    const saltG = flourG * (salt / 100);
    const yeastG = flourG * (effectiveYeast / 100);
    const oilG = flourG * (oil / 100);

    return {
      totalWeight,
      flourG,
      waterG,
      saltG,
      yeastG,
      oilG,
      sumPercentages
    };
  }, [numBalls, ballWeight, hydration, salt, effectiveYeast, oil]);

  const reset = () => {
    setNumBalls(1);
    setBallWeight(250);
    setHydration(62.5);
    setSalt(2.5);
    setYeast(0.15);
    setOil(0);
    setAutoYeast(true);
    setRtTime(4);
    setRtTemp(21);
    setCtTime(24);
    setCtTemp(4);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#FF6321] p-2 rounded-xl shadow-sm">
              <Pizza className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{txt.appTitle}</h1>
              <p className="text-sm text-gray-500 italic">{txt.appSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-[#FF6321] transition-colors shadow-sm"
              title={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
            >
              {lang === 'fr' ? 'EN' : 'FR'}
            </button>
            <button 
              onClick={reset}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors group"
              title={txt.reset}
            >
              <RefreshCw className="w-5 h-5 text-gray-400 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inputs Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-6 pb-2 border-bottom border-gray-50">
              <Zap className="w-4 h-4 text-[#FF6321]" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">{txt.parameters}</h2>
            </div>

            <div className="space-y-6">
              <InputField 
                label={txt.numBalls} 
                value={numBalls} 
                onChange={setNumBalls} 
                min={1} 
                step={1}
                icon={<Utensils className="w-4 h-4" />}
              />
              <InputField 
                label={txt.ballWeight} 
                value={ballWeight} 
                onChange={setBallWeight} 
                min={1} 
                unit="g"
                icon={<Scale className="w-4 h-4" />}
              />
              <div className="h-px bg-gray-100 my-4" />
              <InputField 
                label={txt.hydration} 
                value={hydration} 
                onChange={setHydration} 
                min={0} 
                max={100} 
                step={0.1}
                unit="%"
                icon={<Droplets className="w-4 h-4" />}
              />
              <InputField 
                label={txt.salt} 
                value={salt} 
                onChange={setSalt} 
                min={0} 
                step={0.1}
                unit="%"
              />
              <InputField 
                label={txt.oil} 
                value={oil} 
                onChange={setOil} 
                min={0} 
                step={0.1}
                unit="%"
              />

              <div className="h-px bg-gray-100 my-6" />
              
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#FF6321]" />
                  {txt.autoYeast}
                </label>
                <button 
                  onClick={() => setAutoYeast(!autoYeast)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6321] focus:ring-offset-2 ${autoYeast ? 'bg-[#FF6321]' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoYeast ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <AnimatePresence mode="popLayout">
                {autoYeast ? (
                  <motion.div 
                    key="auto"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label={txt.rtTime} value={rtTime} onChange={setRtTime} min={0} step={0.5} icon={<Clock className="w-4 h-4" />} />
                      <InputField label={txt.rtTemp} value={rtTemp} onChange={setRtTemp} min={0} step={0.5} icon={<Thermometer className="w-4 h-4" />} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label={txt.ctTime} value={ctTime} onChange={setCtTime} min={0} step={0.5} icon={<Snowflake className="w-4 h-4" />} />
                      <InputField label={txt.ctTemp} value={ctTemp} onChange={setCtTemp} min={0} step={0.5} icon={<Thermometer className="w-4 h-4" />} />
                    </div>
                    <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex justify-between items-center mt-2">
                      <span className="text-sm text-orange-800 font-medium">{txt.calcYeast}</span>
                      <span className="text-xl font-bold text-[#FF6321]">{calculatedYeast.toFixed(3)}%</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="manual"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <InputField 
                      label={txt.manualYeast} 
                      value={yeast} 
                      onChange={setYeast} 
                      min={0} 
                      step={0.01}
                      unit="%"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>

          {/* Results Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="bg-[#151619] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-8 opacity-50">
                  <Info className="w-4 h-4" />
                  <h2 className="text-xs font-semibold uppercase tracking-widest">{txt.resultsTitle}</h2>
                </div>

                <div className="space-y-6">
                  <ResultRow label={txt.flour} value={results.flourG} unit="g" />
                  <ResultRow label={txt.water} value={results.waterG} unit="g" />
                  <ResultRow label={txt.salt} value={results.saltG} unit="g" />
                  <ResultRow label={txt.yeast} value={results.yeastG} unit="g" />
                  {results.oilG > 0 && <ResultRow label={txt.oil} value={results.oilG} unit="g" />}
                </div>

                <div className="mt-10 pt-6 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{txt.totalWeight}</p>
                    <p className="text-3xl font-light tracking-tight">{results.totalWeight.toLocaleString()} <span className="text-lg opacity-50">g</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{txt.totalRatio}</p>
                    <p className="text-xl font-mono opacity-80">{results.sumPercentages.toFixed(3)}</p>
                  </div>
                </div>
              </div>
              
              {/* Decorative background element */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#FF6321] opacity-10 rounded-full blur-3xl" />
            </div>
          </motion.section>
        </main>

        <WaterTemperatureCalculator lang={lang} />

        <footer className="mt-12 text-center text-gray-400 text-xs py-8 border-t border-gray-200">
          <p>{txt.footer}</p>
        </footer>
      </div>
    </div>
  );
}

function InputField({ 
  label, 
  value, 
  onChange, 
  min, 
  max, 
  step = 1, 
  unit, 
  icon 
}: { 
  label: string; 
  value: number; 
  onChange: (val: number) => void; 
  min?: number; 
  max?: number; 
  step?: number; 
  unit?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {icon && <span className="text-gray-400 group-focus-within:text-[#FF6321] transition-colors">{icon}</span>}
          {label}
        </label>
        {unit && <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded uppercase">{unit}</span>}
      </div>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-lg font-medium focus:ring-2 focus:ring-[#FF6321]/20 focus:bg-white transition-all outline-none"
        />
      </div>
    </div>
  );
}

function ResultRow({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex justify-between items-center group">
      <span className="text-white/60 font-medium">{label}</span>
      <div className="flex items-baseline gap-1">
        <AnimatePresence mode="wait">
          <motion.span 
            key={value}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-semibold tabular-nums"
          >
            {value.toFixed(2)}
          </motion.span>
        </AnimatePresence>
        <span className="text-sm text-white/30">{unit}</span>
      </div>
    </div>
  );
}
