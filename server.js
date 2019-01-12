var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");
var PORT = process.env.PORT || 8080;
var app = express();
// end global variables
app.use(logger("dev"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static("public"));
mongoose.connect("mongodb://localhost/leaguescrapper", {useNewUrlParser: true});
// end establishing app connections

// scrapes league articiles
app.get("/scrape", (req,res) => {
    // pull the articles from site
    axios.get("https://na.leagueoflegends.com/en/news/").then(function(response) {
        // set response data as cheerio
        var $ = cheerio.load(response.data);
        var url = "https://na.leagueoflegends.com";
        // cheerio selector then each iteration of child elements.
        $(".gs-container").each(function(i, element){
            var result = {};
            result.title = $(this).find("div.field").children("a").attr("title");
            result.image = $(this).find("div.file").children("img").attr("src");
            result.link = url + $(this).find("div.field").children("a").attr("href");
            result.description = $(this).find("div.teaser-content").children("div.field").text();
            // scrape completed time to store the obj in mongo
            // some of the scapres return null as the values, tried escaping it above but didn't work as hoped
                db.Article.findOne({link: result.link})
                .then(function(alreadythere) {
                    if(alreadythere || alreadythere == null) {
                        console.log('already there or null');
                    } else {
                        db.Article.create(result)
                            .then(function (newArticle) {
                                console.log('article added');
                            })
                            .catch(function (err) {
                                console.log(err);
                            });
                    }
                })
                .catch(function(err) {
                    console.log(err);
                })
        });
        
    });
    
});

// end routes

app.listen(PORT, () => {
    console.log("App running on port " + PORT +".");
})