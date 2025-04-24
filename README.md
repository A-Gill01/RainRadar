# RainRadar: The Commuter's Advocate
RainRadar is a web application that takes the user's location (approximate location based on ip address or via address input) and displays local weather data over a seven day time period, along with relevant commute recommendations for the user based on the returned data.

![homepage](https://github.com/user-attachments/assets/5617af7a-491f-40fa-8221-2891b4aed0c3)
_RainRadar Homepage_

---

By clicking on the current location button, the ip address of the user's device is picked up and converted into geographic coordinates (via a geolocation api). These coordinates are then send to a second and public weather api that returns the local weather data for that geographic location. RainRadar uses this data to provide commute recommendations to the user.

