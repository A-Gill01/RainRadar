import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import path from "node:path"
import {dirname} from "path";
import {fileURLToPath} from "url";
import dotenv from "dotenv";

dotenv.config({path:"./codekey.env"});

const mapsapiKey = process.env.MAPKEY;
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
const mapsapiURL = "https://maps.googleapis.com/maps/api/geocode/json";
const weatherapiURL = "https://api.open-meteo.com/v1/forecast";

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '/public')));

/*Get request from client to the root/home page of the server, which responds by rendering the index.ejs file.*/
app.get("/", (req, res) => {
    res.render("index.ejs",)
});



app.post("/post-address", async (req, res) => {
    const reqData = req.body["addressEntry"];
    const addressData = `?address=${reqData}`;
    try {
        const mapData = await axios.post(mapsapiURL + addressData + `&key=${mapsapiKey}`); /*Post request to capture address entry/form data. It is then sent to the Google Maps API to be converted into and received as Latitude and Longitude coordinates.*/
        const coordinateData = mapData.data.results[0].geometry.bounds.northeast; /*Latitude and Longitude coordinates stored in "coordinateData" variable*/
        const latitudeData = JSON.stringify(coordinateData.lat);
        const longitudeData = JSON.stringify(coordinateData.lng);
        const weatherData = await axios.get(weatherapiURL + `?latitude=${latitudeData}` + `&longitude=${longitudeData}` + `&daily=temperature_2m_max` +`&daily=temperature_2m_min` + `&daily=apparent_temperature_max` + `&daily=apparent_temperature_min` +`&daily=rain_sum` + `&daily=snowfall_sum` + `&daily=precipitation_probability_mean` + `&daily=uv_index_max` + `&daily=weather_code` + `&forecast_days=7` + `&timezone=auto`); /*Weather API URL with individual weather variables over a 7 day time span. Full set of variables is concactenated (individual variables) for easy reading*/
        const weatherVar = weatherData.data.daily; 
        const weekdayArray = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; /*Array used to determine the day of the week (i.e. monday, thursday, etc.)*/
        var weatherCode = weatherVar.weather_code;
        function codeIndex (i) {
            let blockIndex = i
            let urlCode = " ";
                if ((weatherCode[blockIndex]) === 0) {
                  urlCode = "/public/images/weathericons/0.png";
                } else if (((weatherCode[blockIndex]) === 1) || ((weatherCode[blockIndex]) === 2)) {
                  urlCode = `/public/images/weathericons/1.png`;
                } else if ((weatherCode[blockIndex]) === 3) {
                    urlCode = `/public/images/weathericons/3.png`;
                } else if (((weatherCode[blockIndex]) === 45) || ((weatherCode[blockIndex]) === 48)) {
                    urlCode = `/public/images/weathericons/45.png`;
                } else if (((weatherCode[blockIndex]) === 51) || ((weatherCode[blockIndex]) === 53) || ((weatherCode[blockIndex]) === 55)) {
                    urlCode = `/public/images/weathericons/51.png`;
                } else if (((weatherCode[blockIndex]) === 56) || ((weatherCode[blockIndex]) === 57)) {
                    urlCode = `/public/images/weathericons/56.png`;
                } else if (((weatherCode[blockIndex]) === 61) || ((weatherCode[blockIndex]) === 63) || ((weatherCode[blockIndex]) === 65) || ((weatherCode[blockIndex]) === 80) || ((weatherCode[blockIndex]) === 81) || ((weatherCode[blockIndex]) === 82)) {
                    urlCode = `/public/images/weathericons/61.png`;
                } else if (((weatherCode[blockIndex]) === 66) || ((weatherCode[blockIndex]) === 67)) {
                    urlCode = `/public/images/weathericons/66.png`;
                } else if (((weatherCode[blockIndex]) === 71) || ((weatherCode[blockIndex]) === 73) || ((weatherCode[blockIndex]) === 75) || ((weatherCode[blockIndex]) === 77) || ((weatherCode[blockIndex]) === 85) || ((weatherCode[blockIndex]) === 86)) {
                    urlCode = `/public/images/weathericons/71.png`;
                } else if ((weatherCode[blockIndex]) === 95) {
                    urlCode = `/public/images/weathericons/95.png`;
                } else if (((weatherCode[blockIndex]) === 96) || ((weatherCode[blockIndex]) === 99)) {
                    urlCode = `/public/images/weathericons/96.png`;
                };
            return urlCode   
        };
        console.log(weatherVar.apparent_temperature_max);
        var iconZero = codeIndex(0);
        var iconOne = codeIndex(1);
        var iconTwo = codeIndex(2);
        var iconThree = codeIndex(3);
        var iconFour = codeIndex(4);
        var iconFive = codeIndex(5);
        var iconSix = codeIndex(6);
        
        res.render("index.ejs", {
            
            locationData: reqData,
            dateValue: weatherVar.time,
            dayArray: weekdayArray,
            maxTemp: weatherVar.temperature_2m_max,
            minTemp: weatherVar.temperature_2m_min,
            apparentTempMax: weatherVar.apparent_temperature_max,
            appartentTempMin: weatherVar.apparent_temperature_min,
            totalRain: weatherVar.rain_sum,
            totalSnow: weatherVar.snowfall_sum,
            precipProb: weatherVar.precipitation_probability_mean,
            uvIndex: weatherVar.uv_index_max,
            urlZero: iconZero,
            urlOne: iconOne,
            urlTwo: iconTwo,
            urlThree: iconThree,
            urlFour: iconFour,
            urlFive: iconFive,
            urlSix: iconSix
        });
    } catch (error) {
        console.error("Failed to make request:", error.message);
        res.status(500).send("Failed to fetch activity. Please try again.");
    };
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});