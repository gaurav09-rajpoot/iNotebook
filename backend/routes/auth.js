const express = require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');
const { success } = require('concurrently/src/defaults');



const JWT_SECRET ="goodb@oy"
//route 1: create a user :Post"/api/auth/create" .
router.post('/createuser', [
  body('name','enter a valid name').isLength({ min: 3 }),
  body('email','enter a valid email').isEmail(),
  body('password','password should be of character').isLength({ min: 5 }),

],async (req, res) => {
  let success =false;
  //if there are error, return bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({success, errors: errors.array() });
  }
  //check whether this user with this email already exists
  try {
    
  
  let user=await User.findOne({email:req.body.email});
  if(user){
    return res.status(400).json({success,error:"sorry a user with this email alredy exists"})
  }

  const salt =await bcrypt.genSalt(10);
  const secPass = await bcrypt.hash(req.body.password,salt) ;

  //create new user
  user =await User.create({
    name: req.body.name,
    password:secPass  ,
    email: req.body.email,
  })
  // .then(user => res.json(user))
  // .catch(err=> {console.log(err)
  // res.json({error:'please enter a unique value for email',messsaeg:err.message})})
  const data= {
    user:{
      id:user.id

    }
  }
  
  
  const authtoken =jwt.sign(data,JWT_SECRET);
  
  // res.json(user)
  success=true;
  res.json({success, authtoken})

} 
//catch error
catch (error) {
  console.error(error.message);
  res.status(500).send("internal server Error")
}
})
//route 2:  authencaticate a user using :Post"/api/auth/create" .
router.post('/login', [
  body('email','enter a valid email').isEmail(),
  body('password','password should be of character').isLength({ min: 5 }),
],async (req, res) => {
  let success =false;
  //if there are error, return bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const{email,password} =req.body;
  try {
    let user= await User.findOne({email});
    if(!user){
      success=false;

      return res.status(400).json({error:"Please try to login with correct credentials"})
  }
  const passwordCompare = await bcrypt.compare(password,user.password) 
  if(!passwordCompare){
    success=false;
    return res.status(400).json({success,error:"Please try to login with correct credentials"})
 
  }
  const data ={
    user:{
      id:user.id
    }
  }
  const authtoken =jwt.sign(data,JWT_SECRET);
 success=true;
  // res.json(user)
  res.json({success,authtoken})
  
}
  catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error")
  }
  
})
//route 3:  get a logged user  details using :Post"/api/auth/getuser" .
router.post('/getuser',fetchuser, async (req, res) => {
  
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)

    
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error")
    
  }
})



module.exports = router