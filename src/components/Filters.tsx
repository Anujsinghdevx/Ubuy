import React, { useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X, Monitor, ShoppingBag, Palette, Star, Layers } from 'lucide-react';

interface FiltersProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  priceRange: number;
  setPriceRange: (value: number) => void;
  quickPriceFilter: string;
  setQuickPriceFilter: (value: string) => void;
  setSearch: (value: string) => void;
  setSortOption: (value: string) => void;
}

export default function Filters({
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  priceRange,
  setPriceRange,
  quickPriceFilter,
  setQuickPriceFilter,
  setSearch,
  setSortOption,
}: FiltersProps) {
  const [showFilters, setShowFilters] = useState(true);

  const categories = ['All', 'Art', 'Electronics', 'Fashion', 'Other', 'Collectibles'];

  const categoryIcons: { [key: string]: React.ReactNode } = {
    All: <Layers className="w-4 h-4 mr-2" />,
    Art: <Palette className="w-4 h-4 mr-2" />,
    Electronics: <Monitor className="w-4 h-4 mr-2" />,
    Fashion: <ShoppingBag className="w-4 h-4 mr-2" />,
    Collectibles: <Star className="w-4 h-4 mr-2" />,
    Other: <Layers className="w-4 h-4 mr-2" />,
  };

  return (
    <div>
      {/* Expand/Collapse Button for Mobile */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="sm:hidden bg-emerald-500 text-white px-4 py-2 rounded-full mb-4 w-full"
      >
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      {showFilters && (
        <div className="space-y-6">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full rounded-full border-gray-300">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          {/* Category Filter with Icons */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full rounded-full border-gray-300">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  <div className="flex items-center">
                    {categoryIcons[cat]} {cat === 'All' ? 'All Categories' : cat}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Price: ₹{priceRange || 'Any'}
            </label>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={priceRange}
              onChange={(e) => {
                setPriceRange(parseInt(e.target.value));
                setQuickPriceFilter('');
              }}
              className="w-full accent-purple-700 cursor-pointer"
              style={{ height: '6px' }}
            />
          </div>

          {/* Quick Price Filters */}
          <div className="flex flex-wrap gap-2">
            {['under500', '500to1000', 'above1000'].map((range) => (
              <Button
                key={range}
                size="sm"
                variant={quickPriceFilter === range ? 'default' : 'outline'}
                aria-label={`Filter by price range ${range}`}
                onClick={() => {
                  setQuickPriceFilter(range);
                  setPriceRange(0);
                }}
              >
                {range === 'under500' && 'Under ₹500'}
                {range === '500to1000' && '₹500 - ₹1000'}
                {range === 'above1000' && 'Above ₹1000'}
              </Button>
            ))}
          </div>

          {/* Clear Filters */}
          <Button
            variant="outline"
            className="w-full text-white bg-red-500 hover:bg-red-600 rounded-full"
            onClick={() => {
              setSearch('');
              setStatusFilter('all');
              setCategoryFilter('All');
              setSortOption('endingSoon');
              setPriceRange(0);
              setQuickPriceFilter('');
            }}
          >
            <X className="w-4 h-4 mr-2" /> Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
