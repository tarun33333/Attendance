var express = require('express');
var router = express.Router();
const Students=require('../models/students')
const Teachers=require("../models/teachers")

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/all',async (req,res)=>{
  const user=await Teachers.find();

  res.status(200).send(user)
})

module.exports = router;
