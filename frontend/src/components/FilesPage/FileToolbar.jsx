import React from 'react';
import { 
  CheckSquare, 
  Square, 
  ArrowUpDown, 
  ChevronDown, 
  SlidersHorizontal, 
  List, 
  Grid3X3 
} from 'lucide-react';

export default function FileToolbar({
  allSelected,
  toggleSelectAll,
  sortRef,
  showSortMenu,
  setShowSortMenu,
  setShowFilterMenu,
  sortOptions,
  sortField,
  setSortField,
  sortDirection,
  setSortDirection,
  filterRef,
  showFilterMenu,
  filterType,
  setFilterType,
  availableTypes,
  getFileIcon,
  filesCount,
  viewMode,
  setViewMode,
}) {
  return (
    <div className="flex items-center justify-between mb-4 gap-2">
      <div className="flex items-center gap-1">
        {/* Select All */}
        <button
          onClick={toggleSelectAll}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg transition-colors ${
            allSelected
              ? 'text-gray-900 dark:text-[#e8e9f0] bg-gray-100 dark:bg-[#1e2235]'
              : 'text-gray-500 dark:text-[#555870] hover:text-gray-900 dark:hover:text-[#e8e9f0] hover:bg-gray-100 dark:hover:bg-[#1e2235]'
          }`}
        >
          {allSelected ? <CheckSquare size={14} /> : <Square size={14} />}
          <span className="hidden sm:inline">{allSelected ? 'Deselect All' : 'Select All'}</span>
        </button>

        <div className="hidden sm:block h-4 w-px bg-gray-200 dark:bg-[#1e2030] mx-1" />

        {/* Sort Dropdown */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => { setShowSortMenu(!showSortMenu); setShowFilterMenu(false); }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg transition-colors ${
              showSortMenu ? 'text-gray-900 dark:text-[#e8e9f0] bg-gray-100 dark:bg-[#1e2235]' : 'text-gray-500 dark:text-[#555870] hover:text-gray-900 dark:hover:text-[#e8e9f0] hover:bg-gray-100 dark:hover:bg-[#1e2235]'
            }`}
          >
            <ArrowUpDown size={14} />
            <span className="hidden sm:inline">Sort</span>
            <ChevronDown size={10} className="hidden sm:inline" />
          </button>
          {showSortMenu && (
            <div className="absolute left-0 top-9 bg-white dark:bg-[#13151c] border border-gray-200 dark:border-[#1f2130] rounded-xl shadow-xl shadow-black/20 py-1.5 z-10 w-44">
              {sortOptions.map((opt) => (
                <button
                  key={opt.field}
                  onClick={() => {
                    if (sortField === opt.field) {
                      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
                    } else {
                      setSortField(opt.field);
                      setSortDirection('asc');
                    }
                    setShowSortMenu(false);
                  }}
                  className={`flex items-center justify-between w-full px-3.5 py-2 text-xs transition-colors ${
                    sortField === opt.field ? 'text-gray-900 dark:text-[#e8e9f0] bg-gray-100 dark:bg-[#1e2235]' : 'text-gray-500 dark:text-[#8b8fa8] hover:bg-gray-100 dark:hover:bg-[#1e2235]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortField === opt.field && (
                    <span className="text-[10px] text-gray-500 dark:text-[#555870] uppercase">
                      {sortDirection === 'asc' ? 'A\u2192Z' : 'Z\u2192A'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => { setShowFilterMenu(!showFilterMenu); setShowSortMenu(false); }}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg transition-colors ${
              filterType !== 'all' || showFilterMenu ? 'text-gray-900 dark:text-[#e8e9f0] bg-gray-100 dark:bg-[#1e2235]' : 'text-gray-500 dark:text-[#555870] hover:text-gray-900 dark:hover:text-[#e8e9f0] hover:bg-gray-100 dark:hover:bg-[#1e2235]'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">
              {filterType === 'all' ? 'Filter' : filterType}
            </span>
            {filterType !== 'all' && (
              <span
                onClick={(e) => { e.stopPropagation(); setFilterType('all'); setShowFilterMenu(false); }}
                className="w-4 h-4 rounded-full bg-[#4f6ef7] text-white flex items-center justify-center text-[8px] hover:bg-[#e05c5c] transition-colors"
              >
                &#x2715;
              </span>
            )}
            {filterType === 'all' && <ChevronDown size={10} className="hidden sm:inline" />}
          </button>
          {showFilterMenu && (
            <div className="absolute left-0 top-9 bg-white dark:bg-[#13151c] border border-gray-200 dark:border-[#1f2130] rounded-xl shadow-xl shadow-black/20 py-1.5 z-10 w-44">
              <button
                onClick={() => { setFilterType('all'); setShowFilterMenu(false); }}
                className={`flex items-center w-full px-3.5 py-2 text-xs transition-colors ${
                  filterType === 'all' ? 'text-gray-900 dark:text-[#e8e9f0] bg-gray-100 dark:bg-[#1e2235]' : 'text-gray-500 dark:text-[#8b8fa8] hover:bg-gray-100 dark:hover:bg-[#1e2235]'
                }`}
              >
                All Types
              </button>
              <div className="h-px bg-gray-200 dark:bg-[#1e2030] my-1" />
              {availableTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => { setFilterType(type); setShowFilterMenu(false); }}
                  className={`flex items-center gap-2.5 w-full px-3.5 py-2 text-xs transition-colors ${
                    filterType === type ? 'text-gray-900 dark:text-[#e8e9f0] bg-gray-100 dark:bg-[#1e2235]' : 'text-gray-500 dark:text-[#8b8fa8] hover:bg-gray-100 dark:hover:bg-[#1e2235]'
                  }`}
                >
                  {getFileIcon(type, 13)}
                  <span>{type}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hidden sm:block h-4 w-px bg-gray-200 dark:bg-[#1e2030] mx-1" />
        <span className="hidden sm:block text-[11px] text-gray-500 dark:text-[#555870]">
          {filesCount} {filesCount === 1 ? 'item' : 'items'}
          {filterType !== 'all' && ` (${filterType})`}
        </span>
      </div>
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#1a1c26] rounded-lg p-0.5 border border-gray-200 dark:border-[#1f2130]">
        <button
          onClick={() => setViewMode('list')}
          className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-gray-200 dark:bg-[#1e2235] text-gray-900 dark:text-[#e8e9f0]' : 'text-gray-500 dark:text-[#555870] hover:text-gray-700 dark:hover:text-[#8b8fa8]'}`}
        >
          <List size={16} />
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-gray-200 dark:bg-[#1e2235] text-gray-900 dark:text-[#e8e9f0]' : 'text-gray-500 dark:text-[#8b8fa8] hover:text-gray-700 dark:hover:text-[#8b8fa8]'}`}
        >
          <Grid3X3 size={16} />
        </button>
      </div>
    </div>
  );
}
