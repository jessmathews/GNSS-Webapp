import { useState, useCallback } from "react";
import { MapContainer, TileLayer, useMapEvents, Rectangle } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function SimpleRegionSelector({ onSelect }) {
  const [bounds, setBounds] = useState(null);

  useMapEvents({
    click(e) {
      const latlng = e.latlng;
      const size = 5;
      const newBounds = [
        [latlng.lat - size, latlng.lng - size],
        [latlng.lat + size, latlng.lng + size],
      ];
      setBounds(newBounds);
      onSelect(newBounds);
    },
  });

  return bounds && (
    <Rectangle 
      bounds={bounds} 
      pathOptions={{ 
        color: "blue", 
        fillColor: "blue", 
        fillOpacity: 0.2,
        weight: 2
      }} 
    />
  );
}

// Drag-to-create mode for resizable boxes
function DragRegionSelector({ onSelect }) {
  const [bounds, setBounds] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);

  useMapEvents({
    mousedown(e) {
      // Start drawing when mouse is pressed
      setIsDrawing(true);
      setStartPoint(e.latlng);
      setBounds(null); // Clear existing bounds
    },
    
    mousemove(e) {
      // Update bounds while dragging
      if (isDrawing && startPoint) {
        const newBounds = [
          [
            Math.min(startPoint.lat, e.latlng.lat),
            Math.min(startPoint.lng, e.latlng.lng)
          ],
          [
            Math.max(startPoint.lat, e.latlng.lat),
            Math.max(startPoint.lng, e.latlng.lng)
          ]
        ];
        setBounds(newBounds);
      }
    },
    
    mouseup(e) {
      // Finish drawing
      if (isDrawing && startPoint) {
        const finalBounds = [
          [
            Math.min(startPoint.lat, e.latlng.lat),
            Math.min(startPoint.lng, e.latlng.lng)
          ],
          [
            Math.max(startPoint.lat, e.latlng.lat),
            Math.max(startPoint.lng, e.latlng.lng)
          ]
        ];
        setBounds(finalBounds);
        onSelect(finalBounds);
        setIsDrawing(false);
        setStartPoint(null);
      }
    }
  });

  return bounds && (
    <Rectangle 
      bounds={bounds} 
      pathOptions={{ 
        color: "blue", 
        fillColor: "blue", 
        fillOpacity: 0.2,
        weight: 2
      }} 
    />
  );
}

function AdvancedRegionSelector({ onSelect }) {
  const [bounds, setBounds] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState(null);

  const handleMouseDown = useCallback((e) => {
    if (e.originalEvent.shiftKey) {
      setIsDragging(true);
      setDragStart(e.latlng);
      setBounds(null);
    } else if (bounds) {
      const tolerance = 0.5; // degrees
      const [[south, west], [north, east]] = bounds;
      
      const corners = [
        { name: 'nw', lat: north, lng: west },  
        { name: 'ne', lat: north, lng: east },
        { name: 'sw', lat: south, lng: west },
        { name: 'se', lat: south, lng: east }
      ];
      
      const nearCorner = corners.find(corner => 
        Math.abs(corner.lat - e.latlng.lat) < tolerance &&
        Math.abs(corner.lng - e.latlng.lng) < tolerance
      );
      
      if (nearCorner) {
        setIsResizing(true);
        setResizeCorner(nearCorner.name);
      }
    }
  }, [bounds]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging && dragStart) {
      const newBounds = [
        [
          Math.min(dragStart.lat, e.latlng.lat),
          Math.min(dragStart.lng, e.latlng.lng)
        ],
        [
          Math.max(dragStart.lat, e.latlng.lat),
          Math.max(dragStart.lng, e.latlng.lng)
        ]
      ];
      setBounds(newBounds);
    } else if (isResizing && bounds && resizeCorner) {
      const [[south, west], [north, east]] = bounds;
      let newBounds = [[south, west], [north, east]];
      
      switch (resizeCorner) {
        case 'nw':
          newBounds = [[south, e.latlng.lng], [e.latlng.lat, east]];
          break;
        case 'ne':
          newBounds = [[south, west], [e.latlng.lat, e.latlng.lng]];
          break;
        case 'sw':
          newBounds = [[e.latlng.lat, e.latlng.lng], [north, east]];
          break;
        case 'se':
          newBounds = [[e.latlng.lat, west], [north, e.latlng.lng]];
          break;
      }
      
      // Ensure bounds are valid (south < north, west < east)
      newBounds = [
        [
          Math.min(newBounds[0][0], newBounds[1][0]),
          Math.min(newBounds[0][1], newBounds[1][1])
        ],
        [
          Math.max(newBounds[0][0], newBounds[1][0]),
          Math.max(newBounds[0][1], newBounds[1][1])
        ]
      ];
      
      setBounds(newBounds);
    }
  }, [isDragging, dragStart, isResizing, bounds, resizeCorner]);

  const handleMouseUp = useCallback(() => {
    if (isDragging || isResizing) {
      if (bounds) {
        onSelect(bounds);
      }
      setIsDragging(false);
      setIsResizing(false);
      setDragStart(null);
      setResizeCorner(null);
    }
  }, [isDragging, isResizing, bounds, onSelect]);

  useMapEvents({
    mousedown: handleMouseDown,
    mousemove: handleMouseMove,
    mouseup: handleMouseUp
  });

  return bounds && (
    <Rectangle 
      bounds={bounds} 
      pathOptions={{ 
        color: "blue", 
        fillColor: "blue", 
        fillOpacity: 0.2,
        weight: 2
      }} 
    />
  );
}

export default function MapSelector({ onRegionSelect }) {
  const [mode, setMode] = useState('simple');

  const renderSelector = () => {
    switch(mode) {
      case 'simple':
        return <SimpleRegionSelector onSelect={onRegionSelect} />;
      case 'advanced':
        return <AdvancedRegionSelector onSelect={onRegionSelect} />;
      default:
        return <SimpleRegionSelector onSelect={onRegionSelect} />;
    }
  };

  const getInstructions = () => {
    switch(mode) {
      case 'simple':
        return <span><strong>Simple mode:</strong> Click anywhere to create a selection box</span>;
      case 'advanced':
        return <span><strong>Advanced mode:</strong> Hold Shift + drag to create selection, click near corners to resize</span>;
      default:
        return <span><strong>Simple mode:</strong> Click anywhere to create a selection box</span>;
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center gap-4">
        <div className="text-sm text-gray-600">
          {getInstructions()}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('simple')}
            className={`px-3 py-1 text-xs rounded ${
              mode === 'simple' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Simple
          </button>
          <button
            onClick={() => setMode('advanced')}
            className={`px-3 py-1 text-xs rounded ${
              mode === 'advanced' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Advanced
          </button>
        </div>
      </div>
      
      <MapContainer 
        center={[0, 0]} 
        zoom={2} 
        className="h-96 w-full rounded shadow"
        style={{ cursor: mode === 'advanced' ? 'crosshair' : 'default' }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {renderSelector()}
      </MapContainer>
    </div>
  );
}