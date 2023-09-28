import express from 'express';
import axios from 'axios';
import bodyparser from 'body-parser';

const app = express();
const port = 3000;

app.use(bodyparser.urlencoded({ extended: true }));

app.use(express.static("public"));

// 🚩BASE URL FOR FOOD 
const foodURL = "https://api.spoonacular.com/recipes";
// 🚩 API KEY FOR FOOD
const configFood = {
    params: {
        apiKey: "f3f95611d3904d8db52cd15f4656088c",
    }
}

// 🚩BASE URL FOR COCKTAIL
const cocktailURL = "https://www.thecocktaildb.com/api/json/v1/1";

// 🚩 BASE URL FOR LATITUDE AND LONGITUDE
const latLongURL = "http://api.openweathermap.org/geo/1.0/direct";

// 🚩 BASE URL FOR WEATHER INFO
const weatherURL = "https://api.open-meteo.com/v1/forecast";

// 🚩1st time user opens website -- GET REQUEST
app.get('/', (req, res) => {
    res.render('food.ejs');
});


// 🚩USER CHOOSES FOOD AND COCKTAIL -- form has POST hence use app.post
app.post("/", async (req, res) => {
    // ◘◘Meal
    const foodType = req.body["dietType"];
    const cuisineSelected = req.body["nationality"];

    // ◘◘ Cocktail
    const nameCocktail = req.body["cocktailName"];

    // Axios
    try {

        // ◘◘◘ MEALS - SPOONACULAR
        let resp2 = {};
        if (cuisineSelected != "") {
            // using this request to get id of selected dish
            const getinfo = await axios.get(foodURL + `/complexSearch?cuisine=${cuisineSelected}&diet=${foodType}`, configFood);
            const randomIndex = Math.round(Math.random() * 2);
            const getId = getinfo.data;
            const foodId = getId.results[randomIndex].id;

            // using this request to get the details of above selected dish
            resp2 = await axios.get(foodURL + `/${foodId}/information`, configFood);
        }
        else {
            resp2 = await axios.get(foodURL + `/random`, configFood);
        }

        // ♦♦ Get data from Food json response
        const result2 = resp2.data;

        // ◘◘◘ COCKTAIL
        // ♦♦cocktail details getting
        let resp1 = {};
        // if name entered by user then give specific else give random cocktail
        if (nameCocktail != "") {
            resp1 = await axios.get(cocktailURL + `/search.php?s=${nameCocktail}`);
        }
        else {
            resp1 = await axios.get(cocktailURL + `/random.php`);
        }

        // ♦♦ Get data from Cocktail json response
        const result1 = resp1.data;

        // ♦♦ Cocktail ingredients -- push ingredients into array -- referred CHATGPT
        const cocktailIngredArray = [];
        const ingredientKeys = ['strIngredient1', 'strIngredient2', 'strIngredient3', 'strIngredient3', 'strIngredient4', 'strIngredient5', 'strIngredient6', 'strIngredient7', 'strIngredient8', 'strIngredient9', 'strIngredient10', 'strIngredient11', 'strIngredient12'];
        //contains name of keys of ingredients in JSON response
        for (const key of ingredientKeys) {
            if (result1.drinks[0].hasOwnProperty(key)) {
                cocktailIngredArray.push(result1.drinks[0][key]);
            }
        }

        console.log(result1);
        console.log(cocktailIngredArray);
        console.log(result2.title);

        // ◘◘◘ RENDER THE FILE WITH APPROPRIATE VALUES
        res.render("food.ejs", { food: result2, cocktail: result1.drinks[0], cocktailIngredients: cocktailIngredArray });
    }
    catch (error) {
        res.render("error.ejs", { errorMessage: error.message });
    }

});


// 🚩 Weather GET Request
app.get("/weather", (req, res) => {
    res.render("weather.ejs");
});

// 🚩 USER CHOOSES Location -- form has POST hence use app.post
app.post("/weather", async (req, res) => {
    // ◘◘ Getting location name and api key as parameters for config
    const configLatLong = {
        params: {
            q: req.body["cityName"], //key to get name of location
            appid: "aff88fd81258b31cd167064e2d70761b"  //api key with documentation named key
        }
    };

    try {
        // ◘◘ Getting LATITUDE AND LONGITUDE
        const resp1 = await axios.get(latLongURL, configLatLong);
        // 1st we will console.log(resp1) to check
        // Then we will console.log(resp1.data) to check result
        // Now we can finally figure out what to put as object
        // ♦ Latitude and Longitude
        const lat = resp1.data[0].lat;
        const longi = resp1.data[0].lon;
        console.log(lat + " " + longi);

        // ◘◘ Creating parameters for config for weather -- parameters based on documentation
        const weatherConfig = {
            params: {
                latitude: lat,
                longitude: longi,
                daily: "temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,rain_sum,windspeed_10m_max",
                timezone : "auto"
            }
        };

        // ◘◘ WEATHER
        const resp2 = await axios.get(weatherURL,weatherConfig);
        const result = resp2.data.daily;
        console.log(result);

        let cityName = req.body["cityName"];
        cityName = cityName.slice(0,1).toUpperCase() + cityName.slice(1,cityName.length).toLowerCase(); 

        res.render('weather.ejs',{daily:result,city:cityName});
    }
    catch (error) {
        res.render('error.ejs', { errorMessage: error.message });
    }
});


// Listening to server
app.listen(port, () => {
    console.log('listening on port' + port);
});