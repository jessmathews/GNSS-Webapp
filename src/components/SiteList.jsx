import React, { useState, useEffect } from "react";
import { getDownloadUrls } from "../services/gnssApi";

function DownloadModal({ isOpen, onClose, urls, siteName, filters }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = (url, filename) => {
    // Create a temporary link and click it to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    urls.forEach((urlData, index) => {
      setTimeout(() => {
        handleDownload(urlData.url, urlData.filename);
      }, index * 1000); // Stagger downloads by 1 second
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{zIndex:2000}}>
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">
            Download Files for {siteName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="mb-4 text-sm text-gray-600">
          <p><strong>Date Range:</strong> {filters.startDate} to {filters.endDate}</p>
          <p><strong>Data Type:</strong> {filters.dataType}</p>
          <p><strong>Constellation:</strong> {filters.constellation}</p>
        </div>

        <div className="mb-4">
          <button
            onClick={downloadAll}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-2"
          >
            Download All ({urls.length} files)
          </button>
        </div>

        <div className="space-y-2">
          {urls.map((urlData, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <div className="flex-1">
                <div className="font-medium">{urlData.filename}</div>
                <div className="text-sm text-gray-500">{urlData.date}</div>
              </div>
              <button
                onClick={() => handleDownload(urlData.url, urlData.filename)}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SiteList({ sites, filters }) {
  const [downloadUrls, setDownloadUrls] = useState({});
  const [loading, setLoading] = useState({});
  const [modalData, setModalData] = useState(null);

  const handleGetDownloadUrls = async (siteName) => {
    setLoading(prev => ({ ...prev, [siteName]: true }));
    
    try {
      const response = await getDownloadUrls(siteName, filters);
      
      if (response.data.success) {
        setDownloadUrls(prev => ({
          ...prev,
          [siteName]: response.data.urls
        }));
        
        // Open modal with download options
        setModalData({
          urls: response.data.urls,
          siteName: siteName,
          filters: filters
        });
      } else {
        alert(`Error: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error fetching download URLs:', error);
      alert('Failed to fetch download URLs. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [siteName]: false }));
    }
  };

  const getDownloadStatus = (siteName) => {
    if (loading[siteName]) return 'Loading...';
    if (downloadUrls[siteName]) return `${downloadUrls[siteName].length} files ready`;
    return 'Get Downloads';
  };

  return (
    <div className="mt-4">
      <h2 className="font-bold mb-2">GNSS Sites in Selected Region:</h2>
      <div className="space-y-2">
        {sites.map((site, i) => (
          <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <div className="font-medium text-lg">{site.name}</div>
              <div className="text-sm text-gray-600">
                Coordinates: ({site.lat.toFixed(3)}, {site.lon.toFixed(3)})
              </div>
              <div className="text-sm text-gray-600">
                Systems: {site.systems ? site.systems.join(', ') : 'N/A'}
              </div>
              {site.networks && site.networks.length > 0 && (
                <div className="text-sm text-gray-600">
                  Networks: {site.networks.join(', ')}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleGetDownloadUrls(site.name)}
                disabled={loading[site.name]}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  loading[site.name]
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : downloadUrls[site.name]
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {getDownloadStatus(site.name)}
              </button>
              
              {downloadUrls[site.name] && (
                <button
                  onClick={() => setModalData({
                    urls: downloadUrls[site.name],
                    siteName: site.name,
                    filters: filters
                  })}
                  className="px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                >
                  View Files
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {sites.length === 0 && (
        <p className="text-gray-500 italic">
          Select a region on the map to see available GNSS sites.
        </p>
      )}

      <DownloadModal
        isOpen={modalData !== null}
        onClose={() => setModalData(null)}
        urls={modalData?.urls || []}
        siteName={modalData?.siteName || ''}
        filters={modalData?.filters || {}}
      />
    </div>
  );
}