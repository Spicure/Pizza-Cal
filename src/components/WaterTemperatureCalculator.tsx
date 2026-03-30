import React, { useState } from 'react';
import { Thermometer, Link as LinkIcon, Unlink, AlertTriangle, Droplets, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ============================================================================
// LOGIQUE MATHÉMATIQUE (Séparée de l'UI)
// ============================================================================

/**
 * Calcule la température de l'eau requise pour atteindre une température de pâte cible.
 * Basé sur la règle des températures (Température de base).
 * 
 * @param targetTemp Température cible de la pâte en fin de pétrissage
 * @param roomTemp Température ambiante de la pièce
 * @param flourTemp Température de la farine
 * @param friction Facteur d'échauffement du pétrin
 * @returns Température de l'eau requise en °C
 */
export function calculateWaterTemperature(
  targetTemp: number,
  roomTemp: number,
  flourTemp: number,
  friction: number
): number {
  return (targetTemp * 3) - (roomTemp + flourTemp + friction);
}

// Préréglages pour le facteur de friction selon le type de pétrissage
const FRICTION_PRESETS = {
  manual: { label: 'Pétrissage manuel', value: 2 },
  oblique: { label: 'Axe oblique', value: 6 },
  spiral: { label: 'Spirale', value: 9 },
  stand_mixer: { label: 'Robot ménager (ex: KitchenAid)', value: 14 },
  custom: { label: 'Personnalisé...', value: 0 },
};

type FrictionKey = keyof typeof FRICTION_PRESETS;

// ============================================================================
// COMPOSANT UI
// ============================================================================

export default function WaterTemperatureCalculator() {
  // --- ÉTATS ---
  const [targetTemp, setTargetTemp] = useState<number>(24);
  const [roomTemp, setRoomTemp] = useState<number>(21);
  const [flourTemp, setFlourTemp] = useState<number>(21);
  const [isLinked, setIsLinked] = useState<boolean>(true);
  
  const [frictionKey, setFrictionKey] = useState<FrictionKey>('manual');
  const [customFriction, setCustomFriction] = useState<number>(0);

  // --- GESTIONNAIRES D'ÉVÉNEMENTS ET VALIDATION ---
  
  // Limite les valeurs entre 0 et 50 pour éviter les saisies absurdes
  const clamp = (val: number) => {
    if (Number.isNaN(val)) return 0;
    return Math.min(50, Math.max(0, val));
  };

  const handleRoomTempChange = (val: number) => {
    const safeVal = clamp(val);
    setRoomTemp(safeVal);
    // Si lié, on met à jour la farine en même temps
    if (isLinked) {
      setFlourTemp(safeVal);
    }
  };

  const handleFlourTempChange = (val: number) => {
    setFlourTemp(clamp(val));
    // Si l'utilisateur modifie manuellement la farine, on casse le lien
    setIsLinked(false);
  };

  const toggleLink = () => {
    const newLinkedState = !isLinked;
    setIsLinked(newLinkedState);
    // Si on réactive le lien, on resynchronise immédiatement la farine sur l'ambiante
    if (newLinkedState) {
      setFlourTemp(roomTemp);
    }
  };

  // --- CALCULS EN TEMPS RÉEL ---
  const currentFriction = frictionKey === 'custom' ? customFriction : FRICTION_PRESETS[frictionKey].value;
  const waterTemp = calculateWaterTemperature(targetTemp, roomTemp, flourTemp, currentFriction);
  
  // Règle métier : Avertissement si l'eau doit être très froide
  const showColdWarning = waterTemp < 4;

  // --- RENDU ---
  return (
    <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mt-8">
      <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-50">
        <Thermometer className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-bold text-gray-800">Calculateur de Température d'Eau</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Colonne de gauche : Inputs */}
        <div className="space-y-5">
          <TempInput 
            label="Température cible de la pâte" 
            value={targetTemp} 
            onChange={(v) => setTargetTemp(clamp(v))} 
          />
          
          <TempInput 
            label="Température ambiante de la pièce" 
            value={roomTemp} 
            onChange={handleRoomTempChange} 
          />

          <div className="relative">
            <TempInput 
              label="Température de la farine" 
              value={flourTemp} 
              onChange={handleFlourTempChange} 
            />
            <button
              onClick={toggleLink}
              className={`absolute right-0 top-0 text-xs flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                isLinked ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={isLinked ? "Lié à la température ambiante" : "Lier à la température ambiante"}
            >
              {isLinked ? <LinkIcon className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
              {isLinked ? 'Lié à l\'ambiante' : 'Lier à l\'ambiante'}
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 block">
              Échauffement du pétrin (Friction)
            </label>
            <div className="relative">
              <select
                value={frictionKey}
                onChange={(e) => setFrictionKey(e.target.value as FrictionKey)}
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
              >
                {Object.entries(FRICTION_PRESETS).map(([key, { label, value }]) => (
                  <option key={key} value={key}>
                    {label} {key !== 'custom' ? `(+${value}°C)` : ''}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
            
            <AnimatePresence>
              {frictionKey === 'custom' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-2 overflow-hidden"
                >
                  <TempInput 
                    label="Valeur de friction personnalisée" 
                    value={customFriction} 
                    onChange={(v) => setCustomFriction(clamp(v))} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Colonne de droite : Résultat */}
        <div className="flex flex-col justify-center">
          <div className="bg-blue-50 rounded-3xl p-8 text-center relative overflow-hidden border border-blue-100">
            <Droplets className="w-32 h-32 text-blue-500/10 absolute -right-6 -bottom-6" />
            
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2 relative z-10">
              Température de l'eau requise
            </p>
            
            <div className="flex items-start justify-center gap-1 relative z-10">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={waterTemp}
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="text-6xl font-bold text-blue-900 tabular-nums tracking-tighter"
                >
                  {waterTemp.toFixed(1)}
                </motion.span>
              </AnimatePresence>
              <span className="text-2xl font-medium text-blue-700 mt-2">°C</span>
            </div>

            {/* Message d'avertissement si l'eau doit être très froide */}
            <AnimatePresence>
              {showColdWarning && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="mt-6 bg-white/80 backdrop-blur-sm p-4 rounded-2xl text-left flex gap-3 items-start shadow-sm border border-blue-100/50"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-900 leading-relaxed">
                    L'eau doit être très froide. Pensez à utiliser de la <strong>glace pilée</strong> ou à refroidir votre farine au réfrigérateur en amont.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="mt-4 flex gap-2 items-start text-xs text-gray-500 bg-gray-50 p-3 rounded-xl">
            <Info className="w-4 h-4 shrink-0 text-gray-400" />
            <p>
              Calcul basé sur la règle des températures : <br/>
              <code className="bg-gray-200 px-1.5 py-0.5 rounded text-gray-700 font-mono mt-1.5 inline-block">Eau = (Cible × 3) - (Ambiante + Farine + Friction)</code>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// SOUS-COMPOSANT UI (Champ de saisie réutilisable)
// ============================================================================

function TempInput({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: number; 
  onChange: (val: number) => void; 
}) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          value={Number.isNaN(value) ? '' : value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          min={0}
          max={50}
          step={0.5}
          className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-lg font-medium focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none pr-10"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
          °C
        </span>
      </div>
    </div>
  );
}
