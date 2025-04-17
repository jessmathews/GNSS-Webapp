from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from pycountry import countries
app = Flask(__name__)
CORS(app)

with open("gnss_stations.json") as f:
    GNSS_STATIONS = json.load(f)

@app.route("/sites", methods=["POST"])
def get_sites():
    data = request.json
    bounds = data["bounds"]  # [[south, west], [north, east]]
    south, west = bounds[0]
    north, east = bounds[1]

    filtered = [
        {
            "name": site["name"],
            "lat": site["llh"][0],
            "lon": site["llh"][1],
            "systems": site["satellite_system"],
            "networks": [n["name"] for n in site.get("networks", [])],
        }
        for site in GNSS_STATIONS
        if south <= site["llh"][0] <= north and west <= site["llh"][1] <= east
    ]
    return jsonify(filtered)

@app.route("/download", methods=["POST"])
def prepare_download():
    data = request.json
    region = data["region"]
    filters = data["filters"]
    from ftplib import FTP_TLS
    import sys

    email = "jessmathews190@gmail.com"
    directory = "/gnss/data/daily/2025/107/25o"  # Example valid directory
    ftps = FTP_TLS(host='gdc.cddis.eosdis.nasa.gov')
    ftps.login(user='anonymous', passwd=email)
    ftps.prot_p()
    ftps.cwd(directory)
    print(ftps.dir())


    
    #return a formatted dummy URL
    return jsonify({
        "downloadUrl": f"https://example.com/gnss?start={filters['startDate']}&end={filters['endDate']}&type={filters['dataType']}&constellation={filters['constellation']}"
    })

if __name__ == "__main__":
    app.run(debug=True)
