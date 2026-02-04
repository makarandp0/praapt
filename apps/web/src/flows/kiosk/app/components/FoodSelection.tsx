interface FoodSelectionProps {
  selectedFood: string;
  onSelectFood: (food: string) => void;
  onConfirm: () => void;
  beneficiaryName?: string;
  mealCount?: number;
}

export function FoodSelection({ selectedFood, onSelectFood, onConfirm, beneficiaryName = 'Guest', mealCount = 4 }: FoodSelectionProps) {
  const meals = [
    { id: 'rice-dal', name: 'Rice & Dal', description: 'Steamed rice with lentil curry' },
    { id: 'chapati-sabzi', name: 'Chapati & Sabzi', description: 'Wheat flatbread with vegetables' },
    { id: 'khichdi', name: 'Khichdi', description: 'Rice and lentil porridge' },
    { id: 'pulao', name: 'Pulao', description: 'Spiced rice with vegetables' },
  ];

  const handleCardClick = (mealId: string) => {
    onSelectFood(mealId);
    // Auto-advance after brief delay for visual feedback
    setTimeout(() => {
      onConfirm();
    }, 800);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center gap-12 p-12 bg-white">
      {/* Greeting and instructions header */}
      <div className="text-center">
        <p className="text-3xl text-[#666] mb-2">Namaste {beneficiaryName}!</p>
        <p className="text-5xl text-[#333] font-bold">Choose your meal</p>
        <p className="text-2xl text-[#666] mt-2">You can choose from {mealCount} meals today</p>
      </div>

      {/* Meal cards grid */}
      <div className="grid grid-cols-2 gap-8 w-full max-w-4xl">
        {meals.map((meal) => (
          <button
            key={meal.id}
            onClick={() => handleCardClick(meal.id)}
            className={`h-64 p-8 border-8 flex flex-col items-center justify-center gap-4 transition-all ${
              selectedFood === meal.id
                ? 'bg-[#333] border-[#333] text-white scale-105'
                : 'bg-white border-[#999] text-[#333] hover:bg-[#f5f5f5] hover:border-[#666]'
            }`}
          >
            {/* Meal icon placeholder */}
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl ${
                selectedFood === meal.id ? 'bg-white text-[#333]' : 'bg-[#e8e8e8] text-[#666]'
              }`}
            >
              🍽
            </div>

            {/* Meal name */}
            <p className={`text-3xl font-bold ${selectedFood === meal.id ? 'text-white' : 'text-[#333]'}`}>
              {meal.name}
            </p>

            {/* Description */}
            <p className={`text-xl ${selectedFood === meal.id ? 'text-[#ddd]' : 'text-[#666]'}`}>
              {meal.description}
            </p>
          </button>
        ))}
      </div>

      {/* Annotation */}
      <div className="absolute bottom-8 left-8 right-8 p-4 bg-[#f9f9f9] border-2 border-dashed border-[#999]">
        <p className="text-sm text-[#666]">
          <strong>OPTIMIZED:</strong> Greeting merged into food selection header. Single tap selects and auto-advances after 0.8s (visual feedback). Eliminates separate meal availability screen and confirmation screen. Saves 4-6 seconds.
        </p>
      </div>
    </div>
  );
}