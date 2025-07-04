# GNSS Download Tool
A webapp to download GNSS data provided by CDDIS by formulating a region showing all the GNSS sites available in the area seperated by day.

# Screenshots
![image](https://github.com/user-attachments/assets/1591b07d-4b50-4386-8486-00ea7247205f)

# To-Do
- [x] Display a map of the world
- [x] User can select a region in the map; the list of GNSS sites should be revealed
- [x] Resizable Selection Option
- [x] Individual and multiple download options
- [ ] User would then be able to download a data by choosing specific filters
- [ ] Add more GNSS constellations (GPS, Galileo, others)
- Based on user’s selection,
  - [ ] filter the data in the backend
  - [ ] run PVT algorithm on the data
  - [ ] send the results to the frontend to be downloaded or plotted
