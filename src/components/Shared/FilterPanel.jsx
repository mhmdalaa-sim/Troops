import './FilterPanel.css';

const FilterPanel = ({ filters, activeFilter, onFilterChange }) => {
  return (
    <div className="filter-panel">
      {filters.map(filter => (
        <button
          key={filter.value}
          className={`filter-btn ${activeFilter === filter.value ? 'active' : ''}`}
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.icon && <span className="filter-icon">{filter.icon}</span>}
          <span>{filter.label}</span>
          {filter.count !== undefined && (
            <span className="filter-count">{filter.count}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default FilterPanel;
