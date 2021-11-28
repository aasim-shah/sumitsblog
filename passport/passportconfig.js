const express = require('express')
const bcrypt = require('bcrypt')
const conn = require('../db/conn')
const passport = require('passport')
const Usermodel = require('../models/userModel')
const LocalStrategy = require('passport-local').Strategy

passport.use(new LocalStrategy({

    usernameField: 'phone',
},    
   function (username, password, done) {
        Usermodel.findOne({ phone: username }, async function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done('no user found', false); }
        // console.log(password);
        let m =await bcrypt.compare(password , user.password);
        if(!m){return  done('failed' , null)}
        // console.log(user.password);
        return done(null, user);
      });
    }
  ));
  
 
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    Usermodel.findById(id, function(err, user) {
      done(err, user);
    });
  });


  