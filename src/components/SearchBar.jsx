function SearchBar({ placeholder }) {
  return (
    <div className="search-bar">
      <span>⌕</span>
      <input
        type="text"
        placeholder={placeholder}
      />
    </div>
  );
}

export default SearchBar;