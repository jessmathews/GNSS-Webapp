# GNSS Download Tool
A webapp to download GNSS data by selecting region which shows all the GNSS sites available in the area

# Screenshots
![image](https://github.com/user-attachments/assets/12f94425-582b-4763-836d-19a8d9a0c944)
![image](https://github.com/user-attachments/assets/a5708308-5d9d-4bed-83d6-8e7888f3348e)

# To-Do
- [x] Display a map of the world
- [x] User can select a region in the map; the list of GNSS sites should be revealed
- [ ] User would then be able to download a data by choosing specific filters
- [ ] Add more GNSS constellations (GPS, Galileo, others)
  Based on user’s selection,
  - [ ] filter the data in the backend
  - [ ] run PVT algorithm on the data
  - [ ] send the results to the frontend to be downloaded or plotted
