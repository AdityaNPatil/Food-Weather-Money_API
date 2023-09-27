import express from 'express';
import axios from 'axios';
import bodyparser from 'body-parser';

const app = express();
const port = 3000;

app.use(bodyparser.urlencoded({extended: true}));

app.use(express.static("public"));

// 🚩BASE URL FOR FOOD 
const foodURL = "https://api.spoonacular.com/recipes";
// 🚩 API KEY FOR FOOD
const configFood = {
    params:{
        apiKey: "f3f95611d3904d8db52cd15f4656088c",
    }
}

// 🚩BASE URL FOR COCKTAIL
const cocktailURL = "https://www.thecocktaildb.com/api/json/v1/1";

// 🚩1st time user opens website -- GET REQUEST
app.get('/',(req,res)=>{
    res.render('food.ejs');
});


// 🚩USER CHOOSES FOOD AND COCKTAIL -- form has POST hence use app.post
app.post("/",async (req,res)=>{
    // ◘◘Meal
    const foodType = req.body["dietType"];
    const cuisineSelected = req.body["nationality"];

    // ◘◘ Cocktail
    const nameCocktail = req.body["cocktailName"];

    // Axios
    try{

        // ◘◘◘ MEALS - SPOONACULAR
        let resp2 = {};
        if(cuisineSelected!=""){
            // using this request to get id of selected dish
            const getinfo = await axios.get(foodURL+`/complexSearch?cuisine=${cuisineSelected}&diet=${foodType}`,configFood);
            const randomIndex = Math.round(Math.random()*2); 
            const getId = getinfo.data;
            const foodId = getId.results[randomIndex].id;

            // using this request to get the details of above selected dish
            resp2 = await axios.get(foodURL+`/${foodId}/information`,configFood);
        }
        else{
            resp2 = await axios.get(foodURL+`/random`,configFood);
        }

        // ♦♦ Get data from Food json response
        const result2 = resp2.data;
        
        // ◘◘◘ COCKTAIL
        // ♦♦cocktail details getting
        let resp1={};
        // if name entered by user then give specific else give random cocktail
        if(nameCocktail!=""){
            resp1 = await axios.get(cocktailURL+`/search.php?s=${nameCocktail}`);
        }
        else{
            resp1 = await axios.get(cocktailURL+`/random.php`);   
        }
        
        // ♦♦ Get data from Cocktail json response
        const result1 = resp1.data;   
        
        // ♦♦ Cocktail ingredients -- push ingredients into array -- referred CHATGPT
        const cocktailIngredArray = [];
        const ingredientKeys = ['strIngredient1', 'strIngredient2','strIngredient3','strIngredient3','strIngredient4','strIngredient5','strIngredient6','strIngredient7','strIngredient8','strIngredient9','strIngredient10','strIngredient11','strIngredient12']; 
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
        res.render("food.ejs",{food:result2 ,cocktail : result1.drinks[0],cocktailIngredients:cocktailIngredArray});
    }
    catch(error){
        res.render("error.ejs",{errorMessage : error.message});
    }

});


// 🚩 Weather GET Request
app.get("/weather",(req, res)=>{
    res.render("weather.ejs");
});


// Listening to server
app.listen(port,()=>{
    console.log('listening on port'+port);
});