
function SearchBar({ placeholder, value, onChange }) {
  return (
    <div className="search-bar">
      <span aria-hidden="true">⌕</span>

      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;
