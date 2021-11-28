const jwt = require('jsonwebtoken')
const User = require('../models/userModel')





const tokenauth = async  (req , res , next) =>{
    try {
      token = req.cookies.Token;
      let verifyUser = await jwt.verify(token , 'stgfingsecretkey')
        const authUser =await User.findOne({_id : verifyUser._id})
        req.user = authUser;
      next();
    } catch (error) {
      return res.send('no auth');
    console.log(error);
    console.log('hahha');
    }


  
  }


  module.exports = tokenauth ;
