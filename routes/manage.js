var express = require('express');
var router = express.Router();
const app = express()
const port = 3000
const mysql = require('mysql');
const bodyParser = require('body-parser');

var dbConn = mysql.createConnection({
    host: "mysql.app.scottclandis.com",
    user: "scottclandis",
    password: "Gordan24",
    database: "vinyl_collection"
});

router.post('/', function(req, res, next) {
  console.log("manage")
});

router.post('/addToCollection', (req, res) => {

  var album = [
    req.body.artist,
    req.body.album_name,
    req.body.album_art,
    req.body.category,
    req.body.mbid,
    req.body.color,
    req.body.size,
    req.body.notes
    ];

    var dup = {
      dupResponse: 'duplicate'  
    }
  dbConn.query("INSERT INTO collection (artist, album_name, album_art, category, mbid, color, size, notes) VALUES ( ? )", [album],
  function (error, results) {
    console.log("error test", error)

    if (error){
      if (error.errno === 1062){
        console.log('dupe')
        return res.send({
         
          data: 'dupe'
         
        })
      }  
      else{
        return res.send({
          data: error.code
        })
      }
    }
    else{
     
      return res.send({
          error: false,
          data: results,
          message: 'New records has been created successfully.'
      });
    }
  });

});

module.exports = router;
