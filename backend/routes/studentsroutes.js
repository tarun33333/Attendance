var express = require('express');
var router = express.Router();
const Student=require('../models/students')


router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});


router.get('/all',async (req,res)=>{
  const user=await Student.find();

  res.status(200).send(user)
})

module.exports = router;
