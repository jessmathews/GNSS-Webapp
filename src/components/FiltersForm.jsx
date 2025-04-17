export default function FiltersForm({ filters, setFilters }) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block">Start Date:</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="p-2 border rounded w-full"
          />
        </div>
        <div>
          <label className="block">End Date:</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="p-2 border rounded w-full"
          />
        </div>
        <div>
          <label className="block">GNSS Constellation:</label>
          <select
            value={filters.constellation}
            onChange={(e) => setFilters({ ...filters, constellation: e.target.value })}
            className="p-2 border rounded w-full"
          >
            <option value="GPS">GPS</option>
            <option value="Galileo">Galileo</option>
            <option value="GLONASS">GLONASS</option>
          </select>
        </div>
        <div>
          <label className="block">Data Type:</label>
          <select
            value={filters.dataType}
            onChange={(e) => setFilters({ ...filters, dataType: e.target.value })}
            className="p-2 border rounded w-full"
          >
            <option value="Broadcast">Broadcast</option>
            <option value="Precise">Precise</option>
          </select>
        </div>
      </div>
    );
  }
  