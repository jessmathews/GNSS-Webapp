import { useState, useEffect } from "react";
import MapSelector from "../components/MapSelector";
import FiltersForm from "../components/FiltersForm";
import SiteList from "../components/SiteList";
import { fetchSites, requestDownload } from "../services/gnssApi";

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [sites, setSites] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "2025-04-01",
    endDate: "2025-04-03",
    constellation: "GPS",
    dataType: "Broadcast",
  });

  useEffect(() => {
    if (!selectedRegion) return;
    const fetchAndSetSites = async () => {
      try {
        const res = await fetchSites(selectedRegion);
        setSites(res.data);
        console.log(`Found ${res.data.length} sites in selected region`);
      } catch (error) {
        console.error('Error fetching sites:', error);
        alert('Failed to fetch sites. Please try again.');
      }
    };
    fetchAndSetSites();
  }, [selectedRegion, filters.startDate, filters.endDate]);

  const handleRegionSelect = (bounds) => {
    setSelectedRegion(bounds);
  };

  const handleBulkDownload = async () => {
    if (!selectedRegion) {
      alert("Please select a region first");
      return;
    }
    
    try {
      const res = await requestDownload(selectedRegion, filters);
      if (res.data.bulkDownloadAvailable) {
        window.open(res.data.downloadUrl, "_blank");
      } else {
        alert("Bulk download not available. Use individual site download buttons below.");
      }
    } catch (error) {
      console.error('Error preparing bulk download:', error);
      alert('Failed to prepare bulk download. Use individual site downloads.');
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">GNSS Data Download Tool</h1>
        <p className="text-gray-600">
          Select a region on the map to discover GNSS stations, then download data using the filters below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MapSelector onRegionSelect={handleRegionSelect} />
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Download Filters</h3>
            <FiltersForm filters={filters} setFilters={setFilters} />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Data Source</h4>
            <p className="text-sm text-gray-600 mb-2">
              Files are downloaded from NASA's CDDIS (Crustal Dynamics Data Information System) archive.
            </p>
            <p className="text-sm text-gray-600">
              <strong>File Types:</strong>
              <br />• Broadcast: Navigation messages (.n, .l, .g files)
              <br />• Precise: Observation data (.o files)
            </p>
          </div>

          <button
            onClick={handleBulkDownload}
            disabled={!selectedRegion}
            className={`w-full py-3 rounded font-medium ${
              selectedRegion
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Bulk Download (Legacy)
          </button>
        </div>
      </div>

      <div className="mt-6">
        <SiteList sites={sites} filters={filters} />
      </div>
    </div>
  );
}