from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime, timedelta
import re
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app)

with open("gnss_stations.json") as f:
    GNSS_STATIONS = json.load(f)

def get_day_of_year(date_str):
    """Convert to day of year"""
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    return date_obj.timetuple().tm_yday

def generate_cddis_url(site_name, date_str, data_type, constellation):
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    year = date_obj.year
    day_of_year = get_day_of_year(date_str)
    
    # Clean site name - ensure it's 4 characters and lowercase
    site_code = site_name.lower()[:4]
    
    base_url = "https://cddis.nasa.gov/archive/gnss/data/daily"
    
    """
    # Determine file extension and path based on data type and constellation
    if data_type == "Broadcast":
        if constellation == "GPS":
            file_path = f"{base_url}/{year}/{day_of_year:03d}/{year % 100:02d}n"
            filename = f"{site_code}{day_of_year:03d}0.{year % 100:02d}n.Z"
        elif constellation == "Galileo":
            file_path = f"{base_url}/{year}/{day_of_year:03d}/{year % 100:02d}l"
            filename = f"{site_code}{day_of_year:03d}0.{year % 100:02d}l.Z"
        elif constellation == "GLONASS":
            file_path = f"{base_url}/{year}/{day_of_year:03d}/{year % 100:02d}g"
            filename = f"{site_code}{day_of_year:03d}0.{year % 100:02d}g.Z"
    else:  # Precise
        if constellation == "GPS":
            file_path = f"{base_url}/{year}/{day_of_year:03d}/{year % 100:02d}o"
            filename = f"{site_code}{day_of_year:03d}0.{year % 100:02d}o.Z"
        elif constellation == "Galileo":
            file_path = f"{base_url}/{year}/{day_of_year:03d}/{year % 100:02d}o"
            filename = f"{site_code}{day_of_year:03d}0.{year % 100:02d}o.Z"
        elif constellation == "GLONASS":
            file_path = f"{base_url}/{year}/{day_of_year:03d}/{year % 100:02d}o"
            filename = f"{site_code}{day_of_year:03d}0.{year % 100:02d}o.Z"
    """
    # return f"{file_path}/{filename}"
    return f"{base_url}/{year}/{day_of_year:03d}/{year % 100:02d}o"

def generate_date_range_urls(site_name, start_date, end_date, data_type, constellation):
    """Generate URLs for all dates in the range"""
    urls = []
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    
    current_date = start
    while current_date <= end:
        date_str = current_date.strftime("%Y-%m-%d")
        url = generate_cddis_url(site_name, date_str, data_type, constellation)
        urls.append({
            "date": date_str,
            "url": url,
            "filename": url.split("/")[-1]
        })
        current_date += timedelta(days=1)
    
    return urls

def list_cddis_files_in_dir(dir_url):
    """
    Return a set of filenames listed in the given CDDIS directory URL.
    """
    # Ensure the URL ends with '*?list'
    if not dir_url.endswith("*?list"):
        if not dir_url.endswith("/"):
            dir_url += "/"
        dir_url += "*?list"

    try:
        resp = requests.get(dir_url, timeout=10)
        resp.raise_for_status()
        files = set()
        for line in resp.text.splitlines():
            filename = line.strip()
            if filename and "." in filename:
                files.add(filename.split()[0])
        return files
    
    except Exception as e:
        print(f"Error listing {dir_url}: {e}")
        return set()

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

@app.route("/download-urls", methods=["POST"])
def get_download_urls():
    """Generate download URLs for a specific site and filters, only returning available files."""
    data = request.json
    site_name = data["siteName"]
    filters = data["filters"]
    try:
        urls = generate_date_range_urls(
            site_name,
            filters["startDate"],
            filters["endDate"],
            filters["dataType"],
            filters["constellation"]
        )
        dir_to_files = {}
        for url_info in urls:
            dir_url = "/".join(url_info["url"].split("/")[:-1]) + "/"
            dir_to_files.setdefault(dir_url, []).append(url_info)
        available_urls = []
        for dir_url, url_infos in dir_to_files.items():
            files_in_dir = list_cddis_files_in_dir(dir_url)
            for url_info in url_infos:
                available_urls.append(url_info)
        return jsonify({
            "success": True,
            "urls": available_urls,
            "siteName": site_name,
            "filters": filters
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 400

@app.route("/download", methods=["POST"])
def prepare_download():
    """Bulk download preparation (future endpoint)"""
    data = request.json
    region = data["region"]
    filters = data["filters"]
    
    # This could be enhanced to create a zip file of multiple sites
    # For now, return a message about using individual site downloads
    return jsonify({
        "message": "Use individual site download buttons for CDDIS data",
        "bulkDownloadAvailable": False
    })

if __name__ == "__main__":
    app.run(debug=True)