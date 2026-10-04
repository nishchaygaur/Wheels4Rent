import React from 'react';
import { Car, CarCategory, FuelType, TransmissionType } from '../types';
import { CarCard } from './CarCard';
import { Search, SlidersHorizontal, ArrowUpDown, Sparkles } from 'lucide-react';

interface FleetSectionProps {
  cars: Car[];
  onSelectCar: (car: Car) => void;
  onBookCar: (car: Car) => void;
  initialCategory?: string;
}

export const FleetSection: React.FC<FleetSectionProps> = ({
  cars,
  onSelectCar,
  onBookCar,
  initialCategory = 'all',
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>(initialCategory);
  const [selectedFuel, setSelectedFuel] = React.useState<string>('all');
  const [selectedTransmission, setSelectedTransmission] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<'price-asc' | 'price-desc' | 'rating' | 'stock'>('price-asc');

  // Keep synced if hero search passes a category
  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const categories = [
    { id: 'all', label: 'All Fleet' },
    { id: 'SUV', label: 'SUVs & Crossovers' },
    { id: 'Off-road', label: '4x4 Off-Road' },
    { id: 'MPV', label: '7-Seater MPVs' },
    { id: 'Sedan', label: 'Executive Sedans' },
    { id: 'Luxury', label: 'Luxury & EVs' },
    { id: 'Hatchback', label: 'Hatchbacks' },
  ];

  // Filtering logic
  const filteredCars = React.useMemo(() => {
    return cars
      .filter((car) => {
        const matchesSearch =
          car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          car.brand.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedCategory === 'all' || car.category === selectedCategory;

        const matchesFuel =
          selectedFuel === 'all' || car.fuel_type === selectedFuel;

        const matchesTransmission =
          selectedTransmission === 'all' || car.transmission === selectedTransmission;

        return matchesSearch && matchesCategory && matchesFuel && matchesTransmission;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return Number(a.daily_price || 0) - Number(b.daily_price || 0);
        if (sortBy === 'price-desc') return Number(b.daily_price || 0) - Number(a.daily_price || 0);
        if (sortBy === 'rating') return Number(b.rating || 0) - Number(a.rating || 0);
        if (sortBy === 'stock') return Number(b.available_quantity || 0) - Number(a.available_quantity || 0);
        return 0;
      });
  }, [cars, searchTerm, selectedCategory, selectedFuel, selectedTransmission, sortBy]);

  return (
    <section id="fleet-section" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-brand-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Self-Drive Inventory</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explore Verified Rental Cars
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Choose your preferred drive. All cars are sanitised, FASTag integrated, and fully insured.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-2 text-xs font-semibold text-slate-400 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800">
          <span>Showing:</span>
          <span className="text-brand-400 font-bold">{filteredCars.length}</span>
          <span>of {cars.length} cars</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4 mb-10">
        
        {/* Top Controls: Search + Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Thar, Slavia, Fortuner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
            />
          </div>

          {/* Fuel Filter */}
          <div className="relative">
            <select
              value={selectedFuel}
              onChange={(e) => setSelectedFuel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-brand-500 transition cursor-pointer"
            >
              <option value="all">Fuel: All Types</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric (EV)</option>
            </select>
          </div>

          {/* Transmission Filter */}
          <div className="relative">
            <select
              value={selectedTransmission}
              onChange={(e) => setSelectedTransmission(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-brand-500 transition cursor-pointer"
            >
              <option value="all">Transmission: All</option>
              <option value="Automatic">Automatic Drive</option>
              <option value="Manual">Manual Stick</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-brand-500 transition cursor-pointer"
            >
              <option value="price-asc">Sort: Price (Low to High)</option>
              <option value="price-desc">Sort: Price (High to Low)</option>
              <option value="rating">Sort: Top Rated</option>
              <option value="stock">Sort: Fleet Availability</option>
            </select>
          </div>

        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 border border-brand-400'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

      </div>

      {/* Fleet Grid */}
      {filteredCars.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto">
          <SlidersHorizontal className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No cars matched your criteria</h3>
          <p className="text-slate-400 text-xs mb-6">
            Try adjusting your filters, searching with different keywords, or reset all filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedFuel('all');
              setSelectedTransmission('all');
            }}
            className="px-5 py-2.5 rounded-xl bg-brand-500 text-white text-xs font-semibold hover:bg-brand-400 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {filteredCars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              onSelectCar={onSelectCar}
              onBookCar={onBookCar}
            />
          ))}
        </div>
      )}

    </section>
  );
};
