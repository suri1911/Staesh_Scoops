import React from 'react';
import { useShop } from '../context/ShopContext';

const SearchBar = ({ placeholder = "Search for accessories, jewelry, hair clips...", className = "", onSearch }) => {
  const { searchQuery, setSearchQuery } = useShop();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className={`search-bar-form ${className}`}>
      <div className="input-group input-group-lg border-2 rounded-pill overflow-hidden border bg-white shadow-sm">
        <span className="input-group-text bg-white border-0 ps-4 text-primary">
          <i className="bi bi-search fs-5"></i>
        </span>
        <input
          type="text"
          className="form-control border-0 shadow-none ps-2 pe-2 fs-6"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="btn btn-link text-muted pe-3 text-decoration-none"
            onClick={handleClear}
            title="Clear search"
          >
            <i className="bi bi-x-circle-fill"></i>
          </button>
        )}
        <button type="submit" className="btn btn-primary-custom px-4 rounded-pill m-1">
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
