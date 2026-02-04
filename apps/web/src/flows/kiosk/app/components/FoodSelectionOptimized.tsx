import { type Language, getTranslation, getFontFamily } from '../utils/translations';
import { LanguageToggle } from './LanguageToggle';

interface FoodSelectionOptimizedProps {
  selectedFood: string;
  onSelectFood: (food: string) => void;
  onConfirm: () => void;
  beneficiaryName?: string;
  mealCount?: number;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function FoodSelectionOptimized({ 
  selectedFood, 
  onSelectFood, 
  onConfirm, 
  beneficiaryName = 'Guest', 
  mealCount = 4,
  language,
  onLanguageChange
}: FoodSelectionOptimizedProps) {
  const t = getTranslation(language);
  const fontFamily = getFontFamily(language);
  
  const meals = [
    { id: 'rice-dal', name: t.riceDal, description: t.riceDalDesc },
    { id: 'chapati-sabzi', name: t.chapatiSabzi, description: t.chapatiSabziDesc },
    { id: 'khichdi', name: t.khichdi, description: t.khichdiDesc },
    { id: 'pulao', name: t.pulao, description: t.pulaoDesc },
  ];

  const handleCardClick = (mealId: string) => {
    onSelectFood(mealId);
    // Auto-advance after brief delay for visual feedback
    setTimeout(() => {
      onConfirm();
    }, 800);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center gap-10 px-16 py-12 bg-[#F6F1E8] relative" style={{ fontFamily }}>
      {/* Language toggle - top right */}
      <div className="absolute top-6 right-6 z-10">
        <LanguageToggle currentLanguage={language} onLanguageChange={onLanguageChange} />
      </div>

      {/* Header */}
      <div className="text-center">
        <p className="text-[22px] leading-[30px] text-[#5A6472] mb-2">
          {t.namaste}, {beneficiaryName}
        </p>
        <h2 className="text-[32px] leading-[40px] font-semibold text-[#1D232E]">
          {t.chooseYourMeal}
        </h2>
        <p className="text-[18px] leading-[26px] text-[#5A6472] mt-2">
          {mealCount} {t.mealsAvailableToday}
        </p>
      </div>

      {/* Meal cards grid */}
      <div className="grid grid-cols-2 gap-6 w-full max-w-4xl">
        {meals.map((meal) => (
          <button
            key={meal.id}
            onClick={() => handleCardClick(meal.id)}
            className={`h-56 p-6 rounded-xl flex flex-col items-center justify-center gap-3 transition-all ${
              selectedFood === meal.id
                ? 'bg-[#243B6B] scale-[1.02] shadow-lg'
                : 'bg-[#E7E0D6] hover:bg-[#ddd5ca]'
            }`}
          >
            {/* Meal icon placeholder */}
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl ${
                selectedFood === meal.id ? 'bg-[#F6F1E8] text-[#243B6B]' : 'bg-[#F6F1E8] text-[#5A6472]'
              }`}
            >
              🍽
            </div>

            {/* Meal name */}
            <p className={`text-[24px] leading-[32px] font-semibold ${
              selectedFood === meal.id ? 'text-[#F6F1E8]' : 'text-[#1D232E]'
            }`}>
              {meal.name}
            </p>

            {/* Description */}
            <p className={`text-[16px] leading-[22px] text-center ${
              selectedFood === meal.id ? 'text-[#E7E0D6]' : 'text-[#5A6472]'
            }`}>
              {meal.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
