import react from "react";

export default function SiteList({ sites }) {
    return (
      <div className="mt-4">
        <h2 className="font-bold mb-2">GNSS Sites Near Selected Region:</h2>
        <ul className="list-disc pl-6">
          {sites.map((site, i) => (
            <li key={i}>
              {site.name} 
              ({site.lat.toFixed(3)}, {site.lon.toFixed(3)})
              <br/>
              {site.country}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  