var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
var PORT = process.env.PORT || 3030;
var app = express();
// end global variables
app.use(logger("dev"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/leaguescrapper", {useNewUrlParser: true});
// end establishing app connections

app.get("/scrape", (req,res) => {
    axios.get("https://na.leagueoflegends.com/en/news/").then((response) => {
        var $ = cheerio.load(response.data);
        console.log($);
    })
});

// end routes

app.listen(PORT, () => {
    console.log("App running on port " + PORT +".");
})