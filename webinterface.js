"use strict";

function getDataFromDatabase(sort){
  var p1  = new Promise(

    function(resolve, reject) {
      con.query("SELECT * FROM news ORDER BY " + (sort=='lf'?"Zeit":"rating")+" DESC LIMIT 20", function (err, result) {
        if (err) throw err;
        resolve(result);
      });
  });
  return p1;
}

function searchInDataBase(needle){
  var p1  = new Promise(

    function(resolve, reject) {
      con.query("SELECT * FROM news WHERE Titel LIKE '%"+needle+"%' ", function (err, result) {
        if (err) throw err;
        resolve(result);
      });
  });
  return p1;
}

function getPageFromUrl(uri){
  var end = uri.indexOf("/", 8);
  return uri.substring(0, end);
}

function getRandomInt(min, max) {
  return Math.random() * (max - min) + min;
}


function formatText(title, txt, url, rating) {

  var returnString = "<div class=\"media text-muted pt-3\">";
  returnString+="<div width=\"35px\"><img class=\"mr-2 rounded\" style=\"width: 32px; height: 32px;\" src=\"http://localhost/icon.thumb.";
  returnString+=getThumb(rating);
  returnString+=".png\"><br>";
  returnString+=rating;
  returnString+= "</div><p class=\"media-body pb-3 mb-0 small lh-125 border-bottom border-gray\">";
  returnString+= "<strong class=\"d-block text-gray-dark\">";
  returnString+=title;
  returnString+="</strong>";
  returnString+=txt;
  returnString+="<br><br><a target=\"_blank\" href=\"";
  returnString+=url;
  returnString+="\">Den Artikel auf ";
  returnString+=getPageFromUrl(url);
  returnString+=" lesen</a></p>";

  returnString+="</div>";

  return returnString;

}

function getArticlePreview(article){
  var pos = article.indexOf(' ', 300);
  return article.substring(0, pos) + " ...";
}

function getThumb(rating){
  if (rating < 40){
    return "down";
  }else if (rating > 40 && rating < 75){
    return "ok";
  }else{
    return "up";
  }
}

function compareEntries(a,b){
  if (a['rating'] > b['rating']){
    return -1;
  }else if (a['rating'] < b['rating']){
    return 1;
  }else{
    return 0;
  }
}

function insertData(data, dataset){
  var returnString = data.toString("utf-8");
  var messages = "";

  dataset.forEach(function (set){
    messages += formatText(set['Titel'], getArticlePreview(set['Text']), set['URL'], set['rating']);
  });

  returnString = returnString.replace('{{NEWS}}', messages);
  return returnString;
}


var http = require('http');
var mysql = require('mysql');
var fs = require('fs');
const express = require('express');
const app = express();
app.use(require('body-parser').urlencoded({
  extended: true
}));

var con = mysql.createConnection({
  host: "localhost",
  user: "",
  password: "",
  database: "truenews"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


app.get('/', function (req, res) {
  fs.readFile('index.html', async function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    var dataset = await getDataFromDatabase('lf');
    dataset.forEach(function (set){
      if (!set['rating']){
        var rating = getRandomInt(60,90);
        rating = rating.toString();
        set['rating'] = rating.substring(0, rating.indexOf("."));
      }
    });
    res.write(insertData(data, dataset));
    res.end();
  });
});

app.get('/analysis', function (req, res) {
  fs.readFile('analysis.html', async function(err, data) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
});

app.post('/sort', async function(req, res){
  if (typeof req.body.by !== 'undefined'){
    console.log(req.body.by);
    var dataset = await getDataFromDatabase(req.body.by);
    var messages = "";

    dataset.forEach(function (set){
      if (!set['rating']){
        var rating = getRandomInt(60,90);
        rating = rating.toString();
        set['rating'] = rating.substring(0, rating.indexOf("."));
      }
    });

    dataset.sort(compareEntries);
    console.log(dataset + "");

    dataset.forEach(function (set){

      messages += formatText(set['Titel'], getArticlePreview(set['Text']), set['URL'], set['rating']);
    });
    res.write(messages);
  }
  res.end();

});

app.post('/search', async function(req, res){
  if (typeof req.body.needle !== 'undefined' && req.body.needle.length > 4){


    var dataset = await searchInDataBase(req.body.needle);
    var messages = "<h1>Suchergebnisse für '" + req.body.needle + "':</h1>";

    dataset.forEach(function (set){
      if (!set['rating']){
        var rating = getRandomInt(60,90);
        rating = rating.toString();
        set['rating'] = rating.substring(0, rating.indexOf("."));
      }
    });

    dataset.forEach(function (set){
      messages += formatText(set['Titel'], getArticlePreview(set['Text']), set['URL'], set['rating']);
      console.log(set['Titel']);
    });
    res.write(messages);
  }else{
    console.log('ERROR');
  }

  res.end();
});

app.listen(8080, function () {
  console.log('Example app listening on port 3000!');
});

/*
*/
