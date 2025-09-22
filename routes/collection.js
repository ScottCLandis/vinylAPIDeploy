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

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/fullCollection', function (req, res) {
  dbConn.query('SELECT * FROM collection', function (error, results, fields) {
    
       if (error) throw error;
       return res.send({
           error: false,
           data: results,
           message: 'Full Collection'
       });
   });
 
 });


router.get('/owned', function (req, res) {
  dbConn.query("SELECT * FROM collection WHERE category = 'owned'", function (error, results, fields) {
    
       if (error) throw error;
       return res.send({
           error: false,
           data: results,
           message: 'Owned Record'
       });
   });
 
 });

 router.get('/wishlist', function (req, res) {
  dbConn.query("SELECT * FROM collection WHERE category = 'wanted' OR category = 'ordered'", function (error, results, fields) {
    
       if (error) throw error;
       return res.send({
           error: false,
           data: results,
           message: 'Wanted Records'
       });
  }); 
 });
router.get('/albumDetails', function (req, res) {
  const itemId = parseInt(req.query.id);
  console.log(itemId);
  
  dbConn.query('SELECT * FROM collection WHERE id = ?', [itemId], function (error, results) {
    console.log(results);
    if (error) throw error;
    return res.send({
      error: false,
      data: results,
      message: 'Requested Record'
    });
  });
});

module.exports = router;   
