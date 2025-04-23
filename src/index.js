import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import path from "node:path"
import {dirname} from "path";
import {fileURLToPath} from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
//const geoapiKey = `--geoapify.com Geocoding API key goes here--`; (address to coordinate data)
//const ipgeoapiKey = `--ipgeolocation.io API key goes here--`; (ip address to coordinate data)
const geoapiURL = `https://api.geoapify.com/v1/geocode/search`;
const ipgeoapiURL = 'https://api.ipgeolocation.io/';
const weatherapiURL = "https://api.open-meteo.com/v1/forecast";
const weekdayArray = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; /*Array used to determine the day of the week (i.e. monday, thursday, etc.)*/
var weekdayValues = ["Today"];
var weatherVar = ""; //DAILY weather data (not minutely)//
var iconURLArray = [];
var weatherDataStorage = [];
var weatherCode = weatherVar.weather_code; 
var statsList = [];
var recMessage = [];
var timeValue = "";
var addressData = "";


app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public")));

app.set("views", path.join(__dirname, "./views"))

/*Get request from client to the root/home page of the server, which responds by rendering the index.ejs file.*/
app.get("/", (req, res) => {
    res.render("index.ejs",)
});

//Main Icon Render Function//
function mainRender(i) {
    let blockIndex = i;

    //Current Time//
    const currentHour = (timeValue.getHours())*60;
    const currentMin = timeValue.getMinutes();
    const currentTotal = currentHour + currentMin;
    
    //Current Day's Sunrise//
    const sunRiseTime = new Date(weatherVar.sunrise[i]);
    const sunRiseHour = (sunRiseTime.getHours())*60;
    const sunRiseTotal = sunRiseHour + sunRiseTime.getMinutes();
    
    //Current Day's Sunset//
    const sunSetTime = new Date(weatherVar.sunset[i]);
    const sunSetHour = (sunSetTime.getHours())*60;
    const sunSetTotal = sunSetHour + sunSetTime.getMinutes();
    
    //Time of Day Block//
    let mainCode = "";
    let timeofDay = "";
    if ((i === 0) && (((sunRiseTotal <= currentTotal) && (currentTotal <= 720)) || ((720 <= currentTotal) && (currentTotal <= sunSetTotal)))) {
        timeofDay = `day`;
    } else if ((i === 0) && (((sunSetTotal <= currentTotal) && (currentTotal <= 1339)) || ((0 <= currentTotal) && (currentTotal <= sunRiseTotal)))) {
        timeofDay = `night`;
    } else if (i !== 0) {
        timeofDay = `day`;
    };

    //Main Icon URL Block//
    if ((weatherCode[blockIndex]) === 0) {
        mainCode = `/images/weathericons/SVG/${timeofDay}/0.svg`;
    } else if (((weatherCode[blockIndex]) === 1) || ((weatherCode[blockIndex]) === 2)) {
        mainCode = `/images/weathericons/SVG/${timeofDay}/1.svg`;
    } else if ((weatherCode[blockIndex]) === 3) {
        mainCode = `/images/weathericons/SVG/${timeofDay}/3.svg`;
    } else if (((weatherCode[blockIndex]) === 45) || ((weatherCode[blockIndex]) === 48)) {
        mainCode = `/images/weathericons/SVG/${timeofDay}/45.svg`;
    } else if (((weatherCode[blockIndex]) === 51) || ((weatherCode[blockIndex]) === 53) || ((weatherCode[blockIndex]) === 55)) {
        mainCode = `/images/weathericons/SVG/${timeofDay}/51.svg`;
    } else if (((weatherCode[blockIndex]) === 56) || ((weatherCode[blockIndex]) === 57)) {
        mainCode = `/images/weathericons/SVG/${timeofDay}/56.svg`;
    } else if (((weatherCode[blockIndex]) === 61) || ((weatherCode[blockIndex]) === 63) || ((weatherCode[blockIndex]) === 65) || ((weatherCode[blockIndex]) === 80) || ((weatherCode[blockIndex]) === 81) || ((weatherCode[blockIndex]) === 82)) {
        mainCode = `/images/weathericons/SVG/${timeofDay}/61.svg`;
    } else if (((weatherCode[blockIndex]) === 66) || ((weatherCode[blockIndex]) === 67)) {
        mainCode = `/images/weathericons/SVG/${timeofDay}/66.svg`;
    } else if (((weatherCode[blockIndex]) === 71) || ((weatherCode[blockIndex]) === 73) || ((weatherCode[blockIndex]) === 75) || ((weatherCode[blockIndex]) === 77) || ((weatherCode[blockIndex]) === 85) || ((weatherCode[blockIndex]) === 86)) {
        mainCode = `/images/weathericons/SVG/${timeofDay}/71.svg`;
    } else if ((weatherCode[blockIndex]) === 95) {
        mainCode = `/images/weathericons/SVG/${timeofDay}/95.svg`;
    } else if (((weatherCode[blockIndex]) === 96) || ((weatherCode[blockIndex]) === 99)) {
        mainCode = `/images/weathericons/SVG/${timeofDay}/96.svg`;
    };

    return mainCode;
};
// Recommendation Generator Function//
function statRender(i) { 
    statsList = [];
    recMessage = [];
    const blockIndex = i;
    function avgTemp() {
        if ((weatherVar.apparent_temperature_min[blockIndex] <= 0) && (weatherVar.wind_speed_10m_max[blockIndex] >= 4.8)) {
            statsList.push(`Average Temperature: ${Math.round(((weatherVar.temperature_2m_max[blockIndex]) + (weatherVar.temperature_2m_min[blockIndex])) / 2)} °C (H: ${Math.round(weatherVar.temperature_2m_max[blockIndex])} °C / L: ${Math.round(weatherVar.temperature_2m_min[blockIndex])} °C)`);
            statsList.push(`Feels Like: ${Math.round(weatherVar.apparent_temperature_min[blockIndex])} °C`);
            statsList.push(`Wind: ${Math.round(weatherVar.wind_speed_10m_max[blockIndex])} km/h`)
            recMessage.push(`Wind chill. Dress for very cold weather.`);
        } else if (weatherVar.apparent_temperature_min[blockIndex] <= 0) {
            statsList.push(`Average Temperature: ${Math.round(((weatherVar.temperature_2m_max[blockIndex]) + (weatherVar.temperature_2m_min[blockIndex])) / 2)} °C (H: ${Math.round(weatherVar.temperature_2m_max[blockIndex])} °C / L: ${Math.round(weatherVar.temperature_2m_min[blockIndex])} °C)`);
            recMessage.push(`Dress for cold weather (jacket, gloves, etc).`);
        } else if (0 < weatherVar.apparent_temperature_min[blockIndex] <= 10) {
            statsList.push(`Average Temperature: ${Math.round(((weatherVar.temperature_2m_max[blockIndex]) + (weatherVar.temperature_2m_min[blockIndex])) / 2)} °C (H: ${Math.round(weatherVar.temperature_2m_max[blockIndex])} °C / L: ${Math.round(weatherVar.temperature_2m_min[blockIndex])} °C)`);
            recMessage.push(`Cooler temperatures. A light jacket or sweater recommended`);
        } else if (10 < weatherVar.apparent_temperature_min[blockIndex] <= 17) {
            statsList.push(`Average Temperature: ${Math.round(((weatherVar.temperature_2m_max[blockIndex]) + (weatherVar.temperature_2m_min[blockIndex])) / 2)} °C (H: ${Math.round(weatherVar.temperature_2m_max[blockIndex])} °C / L: ${Math.round(weatherVar.temperature_2m_min[blockIndex])} °C)`);
            recMessage.push(`Warm and comfortable temperatures. Dress accordingly.`);
        } else if (weatherVar.apparent_temperature_min[blockIndex] > 17) {
            statsList.push(`Average Temperature: ${Math.round(((weatherVar.temperature_2m_max[blockIndex]) + (weatherVar.temperature_2m_min[blockIndex])) / 2)} °C (H: ${Math.round(weatherVar.temperature_2m_max[blockIndex])} °C / L: ${Math.round(weatherVar.temperature_2m_min[blockIndex])} °C)`);
            recMessage.push(`Very warm temperatures. Dress light.`);
        };
    };
    function relHumidity() {
        if ((weatherVar.apparent_temperature_min[blockIndex] > 10) && ((60 < Math.round(weatherVar.relative_humidity_2m)) && (Math.round(weatherVar.relative_humidity_2m) < 66))) {
            statsList.push(`Relative Humidity: ${Math.round(weatherVar.relative_humidity_2m)}%`);
            recMessage.push(`It will be humid. Drink plenty of water and stay hydrated.`);
        } else if (Math.round((weatherVar.apparent_temperature_min[blockIndex]) > 10) && (Math.round(weatherVar.relative_humidity_2m) > 65)) {
            statsList.push(`Relative Humidity: ${Math.round(weatherVar.relative_humidity_2m)}%`);
            recMessage.push(`It will be very humid. Stay hydrated and keep cool.`);
        };
    };
    
    if (weatherCode[blockIndex] === 0) {
        avgTemp();
        relHumidity();
        if ((0 <= weatherVar.uv_index_max[blockIndex]) && (weatherVar.uv_index_max[blockIndex] <= 2)) {
            statsList.push(`UV Index: ${(Math.round(weatherVar.uv_index_max[blockIndex])*100)/100}`);
            recMessage.push(`Clear skies. Pack sunglasses if needed.`);
        } else if ((3 <= weatherVar.uv_index_max[blockIndex] <= 5) && (weatherVar.apparent_temperature_min[blockIndex] >= 10)) {
            statsList.push(`UV Index: ${(Math.round(weatherVar.uv_index_max[blockIndex])*100)/100}`);
            recMessage.push(`Clear skies. Sunscreen is recommended.`);
        } else if ((weatherVar.uv_index_max[blockIndex] > 5) && (weatherVar.apparent_temperature_min[blockIndex] >= 10)) {
            statsList.push(`UV Index: ${(Math.round(weatherVar.uv_index_max[blockIndex])*100)/100}`);
            recMessage.push(`Clear skies. Sunscreen and minimal time outdoors is highly recommended.`);
        } else {
            recMessage.push(`Clear and sunny skies today.`)
        };       
    
    } else if (weatherCode[blockIndex] === 1) {
        avgTemp();
        relHumidity();
        if ((0 <= weatherVar.uv_index_max[blockIndex]) && (weatherVar.uv_index_max[blockIndex] <= 2)) {
            statsList.push(`UV Index: ${(Math.round(weatherVar.uv_index_max[blockIndex])*100)/100}`);
            recMessage.push(`Mostly clear. Pack sunglasses if needed.`);
        } else if ((3 <= weatherVar.uv_index_max[blockIndex] <= 5) && (weatherVar.apparent_temperature_min[blockIndex] >= 10)) {
            statsList.push(`UV Index: ${(Math.round(weatherVar.uv_index_max[blockIndex])*100)/100}`);
            recMessage.push(`Mostly clear. Sunscreen is recommended.`);
        } else if ((weatherVar.uv_index_max[blockIndex] > 5) && (weatherVar.apparent_temperature_min[blockIndex] >= 10)) {
            statsList.push(`UV Index: ${(Math.round(weatherVar.uv_index_max[blockIndex])*100)/100}`);
            recMessage.push(`Mostly clear. Sunscreen and minimal time outdoors is highly recommended.`);
        } else {
            recMessage.push(`Mostly clear and sunny skies.`)
        };
    
    } else if (weatherCode[blockIndex] === 2) {
        avgTemp();
        relHumidity();
        if ((0 <= weatherVar.uv_index_max[blockIndex]) && (weatherVar.uv_index_max[blockIndex] <= 2)) {
            statsList.push(`UV Index: ${weatherVar.uv_index_max[blockIndex]}`);
            recMessage.push(`Partly cloudy with breaks of sunshine. Pack sunglasses if needed.`);
        } else if ((3 <= weatherVar.uv_index_max[blockIndex] <= 5) && (weatherVar.apparent_temperature_min[blockIndex] >= 10)) {
            statsList.push(`UV Index: ${weatherVar.uv_index_max[blockIndex]}`);
            recMessage.push(`Partly cloudy with breaks of sunshine. Sunscreen is recommended.`);
        } else if ((weatherVar.uv_index_max[blockIndex] > 5) && (weatherVar.apparent_temperature_min[blockIndex] >= 10)) {
            statsList.push(`UV Index: ${weatherVar.uv_index_max[blockIndex]}`);
            recMessage.push(`Partly cloudy with breaks of sunshine. Sunscreen and minimal time outdoors is highly recommended.`);
        } else {
            recMessage.push(`Partly cloudy today with breaks of sunshine.`)
        };

    } else if ((weatherCode[blockIndex]) === 3) {
        avgTemp();
        relHumidity();
        recMessage.push("Overcast conditions.");

    } else if (((weatherCode[blockIndex]) === 45) || ((weatherCode[blockIndex]) === 48)) {
        let visArray = weatherDataStorage.minutely_15.visibility;
        let visTotal = 0;
        for (let n = 0; (n < visArray.length); n++) {
            visTotal += visArray[n];
        };
        let visFinal = Math.round(visTotal/visArray.length);
        avgTemp();
        relHumidity();
        if (10000 <= visFinal) {
            statsList.push(`Visibility: ${visFinal} m.`); 
            recMessage.push(`Very light fog. Almost clear conditions.`);
        } else if ((1000 <= visFinal) && (visFinal < 10000)) {
            statsList.push(`Visibility: ${visFinal} m.`);
            recMessage.push(`Mild foggy conditions during commute.`);
        } else if ((200 <= visFinal) && (visFinal < 1000)) {
            statsList.push(`Visibility: ${visFinal} m.`);
            recMessage.push(`Moderate fog. Use caution if driving.`);
        } else if (visFinal < 200) {
            statsList.push(`Visibility: ${visFinal} m.`);
            recMessage.push(`Heavy fog and low visibility. Drive with caution.`);
        };

    } else if (((weatherCode[blockIndex]) === 51) || ((weatherCode[blockIndex]) === 53) || ((weatherCode[blockIndex]) === 55)) {
        avgTemp();
        relHumidity();
        statsList.push(`Precipitation Type: Rain Drizzle`)                    
        statsList.push(`POP: ${weatherVar.precipitation_probability_mean[blockIndex]}%`);
        recMessage.push(`Mist and rain drizzle conditions. Pack unbrella for commute.`);
       
    } else if ((weatherCode[blockIndex] === 56) || (weatherCode[blockIndex] === 57)) {
        avgTemp();
        statsList.push(`Precipitation Type: Freezing Drizzle`)
        statsList.push(`POP: ${weatherVar.precipitation_probability_mean[blockIndex]}%`);
        recMessage.push(`Freezing drizzle and slippery conditions. Exercise caution while driving.`);

    } else if ((weatherCode[blockIndex] === 66) || (weatherCode[blockIndex] === 67)) {
        avgTemp();
        statsList.push(`Precipitation Type: Freezing Rain`)
        statsList.push(`Precipitation Sum: ${weatherVar.rain_sum} mm`)
        statsList.push(`POP: ${weatherVar.precipitation_probability_mean[blockIndex]}%`);
        recMessage.push(`Freezing rain and slippery conditions. Exercise caution while commuting.`);
        
    } else if (((weatherCode[blockIndex]) === 61) || ((weatherCode[blockIndex]) === 63) || ((weatherCode[blockIndex]) === 65)) {
        avgTemp();
        relHumidity();
        statsList.push(`Precipitation Type: Rain`)
        statsList.push(`Precipitation Sum: ${Math.round(weatherVar.rain_sum[blockIndex] * 100)/100} mm`)
        statsList.push(`POP: ${weatherVar.precipitation_probability_mean[blockIndex]}%`);
        recMessage.push(`Wet and rainy conditions. Pack umbrella/raincoat for commute.`);

    } else if ((weatherCode[blockIndex] === 80) || (weatherCode[blockIndex] === 81) || (weatherCode[blockIndex] === 82)) {
        avgTemp();
        relHumidity();
        statsList.push(`Precipitation Type: Rain Showers`)
        statsList.push(`Precipitation Sum: ${Math.round(weatherVar.rain_sum[blockIndex] * 100)/100} mm`)
        statsList.push(`POP: ${weatherVar.precipitation_probability_mean[blockIndex]}%`);
        recMessage.push(`Wet conditions and showers throughout the day. Pack umbrella/raincoat for commute.`);

    } else if (((weatherCode[blockIndex]) === 71) || ((weatherCode[blockIndex]) === 73) || ((weatherCode[blockIndex]) === 75)) {
        avgTemp();
        statsList.push(`Precipitation Type: Snow Fall`)
        statsList.push(`Precipitation Sum: ${Math.round(weatherVar.snowfall_sum[blockIndex] * 100)/100} mm`)
        statsList.push(`POP: ${weatherVar.precipitation_probability_mean[blockIndex]}%`);
        recMessage.push(`Drive cautiously and prepare for snowy conditions throughout the day.`);

    } else if ((weatherCode[blockIndex]) === 77) {
        avgTemp();
        statsList.push(`Precipitation Type: Snow Grains`)
        statsList.push(`Precipitation Sum: ${Math.round(weatherVar.snowfall_sum[blockIndex] * 100)/100} mm`)
        statsList.push(`POP: ${weatherVar.precipitation_probability_mean[blockIndex]}%`);
        recMessage.push(`Light snow grains throughout the day.`);
        
    } else if ((weatherCode[blockIndex] === 85) || (weatherCode[blockIndex] === 86)) {
        avgTemp();
        statsList.push(`Precipitation Type: Snow Showers`)
        statsList.push(`Precipitation Sum: ${Math.round(weatherVar.snowfall_sum[blockIndex] * 100)/100} mm`)
        statsList.push(`POP: ${weatherVar.precipitation_probability_mean[blockIndex]}%`);
        recMessage.push(`Brief periods of snow throughout the day. Drive with care.`);
        
    } else if ((weatherCode[blockIndex]) === 95) {
        avgTemp();
        relHumidity();
        statsList.push(`Precipitation Type: Thunderstorm`)
        statsList.push(`Precipitation Sum: ${Math.round(weatherVar.rain_sum[blockIndex] * 100)/100} mm`)
        statsList.push(`POP: ${weatherVar.precipitation_probability_mean[blockIndex]}%`);
        recMessage.push(`Wet and rainy conditions with thunder. Pack umbrella/raincoat for commute.`);
        
    } else if (((weatherCode[blockIndex]) === 96) || ((weatherCode[blockIndex]) === 99)) {
        avgTemp();
        relHumidity();
        statsList.push(`Precipitation Type: Thunderstorm with Hail`)
        statsList.push(`Precipitation Sum: ${Math.round(weatherVar.rain_sum[blockIndex] * 100)/100} mm`)
        statsList.push(`POP: ${weatherVar.precipitation_probability_mean[blockIndex]}%`);
        recMessage.push(`Wet and rainy conditions with thunder and hail. Pack umbrella/raincoat for commute.`);
    };   
};

//Icon Render Loop//
function urlGenerator() {
    iconURLArray = [];
    for (let i = 0; i <= 6; i++) {
        let blockIndex = i;
        let urlCode = "";
            if ((weatherCode[blockIndex]) === 0) {
            urlCode = "/images/weathericons/PNG/0.png";
            } else if (((weatherCode[blockIndex]) === 1) || ((weatherCode[blockIndex]) === 2)) {
            urlCode = `/images/weathericons/PNG/1.png`;
            } else if ((weatherCode[blockIndex]) === 3) {
                urlCode = `/images/weathericons/PNG/3.png`;
            } else if (((weatherCode[blockIndex]) === 45) || ((weatherCode[blockIndex]) === 48)) {
                urlCode = `/images/weathericons/PNG/45.png`;
            } else if (((weatherCode[blockIndex]) === 51) || ((weatherCode[blockIndex]) === 53) || ((weatherCode[blockIndex]) === 55)) {
                urlCode = `/images/weathericons/PNG/51.png`;
            } else if (((weatherCode[blockIndex]) === 56) || ((weatherCode[blockIndex]) === 57)) {
                urlCode = `/images/weathericons/PNG/56.png`;
            } else if (((weatherCode[blockIndex]) === 61) || ((weatherCode[blockIndex]) === 63) || ((weatherCode[blockIndex]) === 65) || ((weatherCode[blockIndex]) === 80) || ((weatherCode[blockIndex]) === 81) || ((weatherCode[blockIndex]) === 82)) {
                urlCode = `/images/weathericons/PNG/61.png`;
            } else if (((weatherCode[blockIndex]) === 66) || ((weatherCode[blockIndex]) === 67)) {
                urlCode = `/images/weathericons/PNG/66.png`;
            } else if (((weatherCode[blockIndex]) === 71) || ((weatherCode[blockIndex]) === 73) || ((weatherCode[blockIndex]) === 75) || ((weatherCode[blockIndex]) === 77) || ((weatherCode[blockIndex]) === 85) || ((weatherCode[blockIndex]) === 86)) {
                urlCode = `/images/weathericons/PNG/71.png`;
            } else if ((weatherCode[blockIndex]) === 95) {
                urlCode = `/images/weathericons/PNG/95.png`;
            } else if (((weatherCode[blockIndex]) === 96) || ((weatherCode[blockIndex]) === 99)) {
                urlCode = `/images/weathericons/PNG/96.png`;
            };
        iconURLArray.push(urlCode);
    };
};

//Weekday Names Loop//
function dayLoop() {
    weekdayValues = ["Today"];
    const currentWeek = weatherVar.time;
    for (let i = 1; i < 7; i++) {
        const dayData = new Date (currentWeek[i]);
        weekdayValues.push(weekdayArray[dayData.getDay()]);
    };
};

//Background Banner Render (Day or Night)//
function bannerRender(i) {
    let blockIndex = i;

    //Current Time//
    const currentHour = (timeValue.getHours())*60;
    const currentMin = timeValue.getMinutes();
    const currentTotal = currentHour + currentMin;
    
    //Current Day's Sunrise//
    const sunRiseTime = new Date(weatherVar.sunrise[i]);
    const sunRiseHour = (sunRiseTime.getHours())*60;
    const sunRiseTotal = sunRiseHour + sunRiseTime.getMinutes();
    
    //Current Day's Sunset//
    const sunSetTime = new Date(weatherVar.sunset[i]);
    const sunSetHour = (sunSetTime.getHours())*60;
    const sunSetTotal = sunSetHour + sunSetTime.getMinutes();
    
    //Time of Day Block//
    let mainCode = "";
    let timeofDay = "";
    if ((i === 0) && (((sunRiseTotal <= currentTotal) && (currentTotal <= 720)) || ((720 <= currentTotal) && (currentTotal <= sunSetTotal)))) {
        timeofDay = "day";
    } else if ((i === 0) && (((sunSetTotal <= currentTotal) && (currentTotal <= 1339)) || ((0 <= currentTotal) && (currentTotal <= sunRiseTotal)))) {
        timeofDay = "night";
    } else if (i !== 0) {
        timeofDay = "day";
    };

    return timeofDay;
};


//Weather Data for User Current Location Request//
app.post("/current-Location", async ( req, res) => {
    try {
        let geolocationData = await axios.get(ipgeoapiURL + `ipgeo?apiKey=` + ipgeoapiKey);
        let latitudeData = geolocationData.data.latitude;
        let longitudeData = geolocationData.data.longitude;
        let weatherData = await axios.get(weatherapiURL + `?latitude=${latitudeData}` + `&longitude=${longitudeData}` + `&daily=temperature_2m_max` +`&daily=temperature_2m_min` + `&daily=apparent_temperature_max` + `&daily=apparent_temperature_min` +`&daily=rain_sum` + `&daily=snowfall_sum` + `&daily=precipitation_probability_mean` + `&daily=uv_index_max` + `&daily=weather_code` + `&daily=sunrise` + `&daily=sunset` + `&forecast_days=7` + `&timezone=auto` + `&current=temperature_2m` + `&minutely_15=visibility` + `&minutely_15=relative_humidity_2m` + `&daily=wind_speed_10m_max`); /*Weather API URL with individual weather variables over a 7 day time span. Full set of variables is concactenated (individual variables) for easy reading*/
        addressData = geolocationData.data.city + `, ` +  (geolocationData.data.state_code[3] + geolocationData.data.state_code[4]) + `, ` + geolocationData.data.country_name;
        weatherVar = weatherData.data.daily;
        weatherDataStorage = weatherData.data;
        weatherCode = weatherVar.weather_code;
        timeValue = new Date (weatherData.data.current.time);
        dayLoop();
        urlGenerator();
        statRender(0);
        res.render("index.ejs", {
            locationData: addressData,
            dateValue: weatherVar.time,
            dayArray: weekdayArray,
            currentTemp: weatherDataStorage.current.temperature_2m,
            apparentTempMax: weatherVar.apparent_temperature_max,
            apparentTempMin: weatherVar.apparent_temperature_min,
            totalRain: weatherVar.rain_sum,
            totalSnow: weatherVar.snowfall_sum,
            precipProb: weatherVar.precipitation_probability_mean,
            uvIndex: weatherVar.uv_index_max,
            statLength: statsList.length, 
            statsArray: statsList,
            messageLength: recMessage.length,
            messageArray: recMessage,
            iconValue: iconURLArray,
            weekDay: weekdayValues,
            mainIcon: mainRender(0),
            timeofDay: bannerRender(0)
        });
    } catch (error) {
        console.error("Failed to make request:", error.message);
        res.status(500).send("Failed to fetch activity. Please try again.");
    };
});

//Weather Data Search and Render Request//
app.post("/post-address", async (req, res) => {
    addressData = req.body["addressEntry"];
   
    try {
        let mapData = await axios.get(geoapiURL + `?text=` + addressData + `&lang=en&limit=5&format=json&apiKey=` + geoapiKey); /*Post request to capture address entry/form data.*/
        let coordinateData = (mapData.data.results[0]); /*Latitude and Longitude coordinates stored in "coordinateData" variable*/
        let latitudeData = JSON.stringify(coordinateData.lat);
        let longitudeData = JSON.stringify(coordinateData.lon);
        let weatherData = await axios.get(weatherapiURL + `?latitude=${latitudeData}` + `&longitude=${longitudeData}` + `&daily=temperature_2m_max` +`&daily=temperature_2m_min` + `&daily=apparent_temperature_max` + `&daily=apparent_temperature_min` +`&daily=rain_sum` + `&daily=snowfall_sum` + `&daily=precipitation_probability_mean` + `&daily=uv_index_max` + `&daily=weather_code` + `&daily=sunrise` + `&daily=sunset` + `&forecast_days=7` + `&timezone=auto` + `&current=temperature_2m` + `&minutely_15=visibility` + `&minutely_15=relative_humidity_2m` + `&daily=wind_speed_10m_max`); /*Weather API URL with individual weather variables over a 7 day time span. Full set of variables is concactenated (individual variables) for easy reading*/
        weatherVar = weatherData.data.daily;
        weatherDataStorage = weatherData.data;
        weatherCode = weatherVar.weather_code;
        timeValue = new Date (weatherData.data.current.time);
        dayLoop();
        urlGenerator();
        statRender(0);
        res.render("index.ejs", {
            locationData: addressData,
            dateValue: weatherVar.time,
            dayArray: weekdayArray,
            currentTemp: weatherDataStorage.current.temperature_2m,
            apparentTempMax: weatherVar.apparent_temperature_max,
            apparentTempMin: weatherVar.apparent_temperature_min,
            totalRain: weatherVar.rain_sum,
            totalSnow: weatherVar.snowfall_sum,
            precipProb: weatherVar.precipitation_probability_mean,
            uvIndex: weatherVar.uv_index_max,
            statLength: statsList.length, 
            statsArray: statsList,
            messageLength: recMessage.length,
            messageArray: recMessage,
            iconValue: iconURLArray,
            weekDay: weekdayValues,
            mainIcon: mainRender(0),
            timeofDay: bannerRender(0)
        });
        
    } catch (error) {
        console.error("Failed to make request:", error.message);
        res.status(500).send("Failed to fetch activity. Please try again.");
    };
});

//IconValue Capture Request//
app.post("/icon-data", async (req, res) => {
    const iconNumber = ((req.body.iconValue) * 1);
    urlGenerator();
    statRender(iconNumber);
    dayLoop();
    try {
        
        res.render("index.ejs", {
            locationData: addressData,
            dateValue: weatherVar.time,
            dayArray: weekdayArray,
            currentTemp: weatherDataStorage.current.temperature_2m,
            maxTemp: weatherVar.temperature_2m_max,
            minTemp: weatherVar.temperature_2m_min,
            apparentTempMax: weatherVar.apparent_temperature_max,
            apparentTempMin: weatherVar.apparent_temperature_min,
            totalRain: weatherVar.rain_sum,
            totalSnow: weatherVar.snowfall_sum,
            precipProb: weatherVar.precipitation_probability_mean,
            uvIndex: weatherVar.uv_index_max,
            weatherCode: iconURLArray,
            statLength: statsList.length, 
            statsArray: statsList,
            messageLength: recMessage.length,
            messageArray: recMessage,
            iconValue: iconURLArray,
            weekDay: weekdayValues,
            mainIcon: mainRender(iconNumber)
        });
    } catch (error) {
        console.error("Failed to make request:", error.message);
        res.status(500).send("Failed to fetch activity. Please try again.");
    };
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});