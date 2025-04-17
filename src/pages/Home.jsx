import { useState } from "react";
import MapSelector from "../components/MapSelector";
import FiltersForm from "../components/FiltersForm";
import SiteList from "../components/SiteList";
import { fetchSites, requestDownload } from "../services/gnssApi";

export default function Home() {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [sites, setSites] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "2024-04-01",
    endDate: "2024-04-10",
    constellation: "GPS",
    dataType: "Precise",
  });

  const handleRegionSelect = async (bounds) => {
    setSelectedRegion(bounds);
    const res = await fetchSites(bounds);

    setSites(res.data);
    console.log(sites)
  };

  const handleDownload = async () => {
    alert("Download functionality under implementation");
    const res = await requestDownload(selectedRegion, filters);
    window.open(res.data.downloadUrl, "_blank");
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">GNSS Data Download Tool</h1>
      <MapSelector onRegionSelect={handleRegionSelect} />
      <SiteList sites={sites} />
      <FiltersForm filters={filters} setFilters={setFilters} />
      <button
        onClick={handleDownload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Download Data
      </button>
    </div>
  );
}
