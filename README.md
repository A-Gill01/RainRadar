# RainRadar: The Commuter's Advocate
RainRadar is a web application that takes the user's location (approximate location based on ip address or via address input) and displays local weather data over a seven day time period, along with relevant commute recommendations for the user based on the returned data.

![homepage](public/images/homepage.gif)
_RainRadar Homepage_

---

By clicking on the current location button, the ip address of the user's device is picked up and converted into geographic coordinates (via a geolocation api). These coordinates are then send to a second and public weather api that returns the local weather data for that geographic location. RainRadar uses this data to provide commute recommendations to the user.

![location button](public/images/location.gif)
_RainRadar Current Location Demo_

---

Alternatively, the user can type an address (free-form and global) into the text box instead of clicking the current location button, and press enter. The typed address is then used to generate the geographic coordinates that allows RainRadar to provide commute recommendations and weather data to the user.

![address input](public/images/addressinput.gif)
_RainRadar Address Field Demo_

---

All relevant statistical/weather data is rendered to the user along with commute recommendations specific to the weather conditions present during that day of the week. The icons on each box representing a day of the week give a general idea of what kind of weather to expect, and the user can click on the box for more specific information and the commute recommendations for that day.

![weather data](public/images/weatherdata.gif)
_RainRadar Weather Data Demo_

---

## Technologies Used
HTML, CSS(Bootstrap/Grid/Flexbox), Javascript (Node.js/Express.js/Axios), RESTful API Architechture

## Getting Started
To begin using RainRadar on your local machine, do the following:
1. Download and install node.js on your device: <https://nodejs.org/>
2. Clone the RainRadar Repository: `git clone https://github.com/A-Gill01/RainRadar.git` (HTTPS)
3. cd to the project's working directory.
4. Install all project dependancies: `npm i`
5. Obtain an API key by registering a free account at `https://myprojects.geoapify.com/login`. Then add your api key into the index.js file (src) in the "geoapiKey" field (line 11).
6. Obtain a second API key by registering a free account at `https://app.ipgeolocation.io/signup`. Then add your api key into the index.js file (src) in the "ipgeoapiKey" field (line 12).
7. Start the server on your device using `nodemon index.js`.
8. Open your device's browser and navigate to <http://localhost:3000>
