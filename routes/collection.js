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
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/fullCollection', function (req, res) {
  dbConn.query('SELECT * FROM collection', function (error, results, fields) {
    
       if (error) throw error;
       return res.send({
           error: false,
           data: results,
           message: 'draftOrder'
       });
   });
 
 });


router.get('/owned', function (req, res) {
  dbConn.query("SELECT * FROM collection WHERE category = 'owned'", function (error, results, fields) {
    
       if (error) throw error;
       return res.send({
           error: false,
           data: results,
           message: 'draftOrder'
       });
   });
 
 });

 router.get('/wishlist', function (req, res) {
  dbConn.query("SELECT * FROM collection WHERE category = 'wanted' OR category = 'ordered'", function (error, results, fields) {
    
       if (error) throw error;
       return res.send({
           error: false,
           data: results,
           message: 'draftOrder'
       });
   });
 
 });

module.exports = router;
