var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");
var db = require("./models");
var PORT = process.env.PORT || 8080;
var app = express();
// end global variables
app.use(logger("dev"));
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static("public"));
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/leaguescrapper";

mongoose.connect(MONGODB_URI);
mongoose.connect(MONGODB_URI, {useNewUrlParser: true});
// end establishing app connections
// Handlebars
app.engine(
    "handlebars",
    exphbs({
      defaultLayout: "main"
    })
  );
  app.set("view engine", "handlebars");
// populate articles
app.get("/", function(req,res) {
    db.Article.find({}).populate("comment").then(function(articles) {
        articles = {article: articles};
        res.render("index",articles);
    }).catch(function(err){console.log(err)})
});
app.post("/comment/:id", function(req,res) {
    db.Comment.create(req.body).then(function(newComment) {
        console.log(newComment);
        return db.Article.findOneAndUpdate({_id: req.params.id},{ $push: { comment: newComment._id} },{new:true});
    }).catch(function(err) {console.log(err)});
    res.redirect("/");
});
app.post("/removecomment/:id", function(req,res) {
    console.log(req.params.id, "should've been removed");
    db.Comment.findOneAndDelete({_id: req.params.id},).then(function(removed) {
            res.redirect("/");
    }).catch(function(err) {console.log(err)})
});
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
            result.image = url +  $(this).find("div.file").children("img").attr("src");
            result.link = (url + $(this).find("div.field").children("a").attr("href"));
            result.description = $(this).find("div.teaser-content").children("div.field").text();
            // scrape completed time to store the obj in mongo
            // some of the scapres return null as the values, tried escaping it above but didn't work as hoped
                db.Article.findOne({link: result.link})
                .then(function(alreadythere) {
                    if(alreadythere == null) {
                        db.Article.create(result)
                            .then(function (newArticle) {
                                console.log('article added');
                            })
                            .catch(function (err) {
                                console.log(err);
                            });
                        } else {
                            console.log('already there or null');
                        
                    }
                })
                .catch(function(err) {
                    console.log(err);
                })
        });
        res.redirect("/../");
    });
});

// end routes

app.listen(PORT, () => {
    console.log("App running on port " + PORT +".");
})