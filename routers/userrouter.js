const express = require('express')
const conn = require('../db/conn')
const bcrpyt = require('bcrypt')
// const userController = require('../models/userModel')
const passport = require('passport')
const local = require('../passport/passportconfig')
const tokenauth = require('../passport/authuser')
const session = require('express-session')
const multer  = require('multer')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
var jwt = require('jsonwebtoken');
const UserController = require('../controllers/userController')
const Usermodel = require('../models/userModel')
const ApplicationModel = require('../models/applicationModel')
const { findByIdAndUpdate } = require('../models/userModel')
const { application } = require('express')
const router = express.Router()
router.use(session({ secret: "cats" }));
router.use(passport.initialize());
router.use(passport.session());
router.use(express.urlencoded({extended : false}))
router.use(express.json())
router.use(session({ secret: "cats" }));
router.use(cookieParser())

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads')   
  },
  filename: function (req, file, cb) {
      let d = file.originalname;
      cb(null, d)      
  }
})
var upload = multer({ storage: storage });

router.get('/' , tokenauth ,(req , res)=> {
  res.send(req.user)
  console.log('hahha');

})

const ensureAdmin = function(req, res, next) {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin) {
        console.log("isAdmin");
      return next();
    } else {
      console.log('not admin');    
     res.redirect('/')
    }
  }}
router.get('/register' , (req, res)=>{
  res.render('registeration')
})
router.post('/register' , async(req ,res) => {
    password = req.body.password;
    cpassword = req.body.cpassword;
    if(password === cpassword){
        let encpassword = await bcrpyt.hash(password , 10)
        const user = new Usermodel({
            first_name : req.body.first_name,
            email : req.body.email ,
            phone : req.body.phone,
            password : encpassword
        })
        const userregistered = await user.save()
        const regtoken = await user.authuser()
        console.log(userregistered);
        console.log('hhaha');
        res.redirect('/user/login')
    }else{
        console.log('cpas doesnt matches');
    }
    
} )


router.post('/login', 
  passport.authenticate('local', { failureRedirect: '/user/login' }), async(req, res) => {
      const loginToken = await req.user.authuser_login()
      res.cookie('Token' , loginToken ,{
        expires : new Date(Date.now() + 1000 * 60*100),
        httpOnly : true 
      })
      // ss = req.user;
      const phone  = req.user.phone;
      console.log(loginToken);
      console.log('hahhaa login');
      let app = await ApplicationModel.findOne({phone : phone});
     if(app){
      switch (app.application_status) {
        case 'pending':
        res.redirect('/user/dashboard')
        break;
        case 'approved':
        res.redirect('/user/approvedapp')
        break;
        case 'rejected':
          res.redirect('/user/rejectedapp')
          break;         
      }
     }else{
      res.redirect('/user/package')
     }
  });

router.get('/logout' , tokenauth , (req , res) => {
  res.clearCookie('Token');
  console.log('logged out');
  res.redirect('/user/login')
})
router.get('/info' , tokenauth,(req ,res) => {
  let e = req.user.id;
  res.render('userdata' , {user : e})
})
const cpUpload = upload.fields([{ name: 'image_1', maxCount: 1 }, { name: 'image_2', maxCount: 1 }, {name : 'image_3', maxCount:1} , {name :'video' , maxCount: 1}])

router.post('/info' ,tokenauth , cpUpload,  async (req , res) => {
let {first_name , middle_name , last_name , email , password , phone , father_name , mother_name , dob, address, state , city , pin_code , referrence1_name , referrence1_contact , referrence2_name ,referrence2_contact , bank_name , account_holder_name , ifsc_code , account_number , documnet_id} = req.body;

const userInfo = {
  first_name : first_name ,
  middle_name : middle_name,
  last_name : last_name,
  phone : phone ,
  email : req.body.email ,
  father_name : father_name ,
  mother_name : mother_name ,
  dob : dob ,
  address : address ,
  state : state ,
  city : city ,
  pin_code : pin_code ,
  referrence1_name : referrence1_name ,
  referrence1_contact : referrence1_contact ,
  referrence2_name : referrence2_name , 
  referrence2_contact : referrence2_contact ,
  bank_name : req.body.bank_name ,
  account_holder_name : account_holder_name ,
  ifscCode : ifsc_code,
  account_number : account_number,
  document_id : documnet_id,
  image_1 :'/'+ req.files['image_1'][0].originalname,
  image_2 :'/'+ req.files['image_2'][0].originalname,
  image_3 : '/'+ req.files['image_3'][0].originalname,
  video : '/'+ req.files['video'][0].originalname,
}
const userinfo = await Usermodel.findByIdAndUpdate(req.user.id , userInfo);
console.log(userinfo);
res.send('done')

})
router.get('/package' , tokenauth , async(req ,res)=> {
  let phone = req.user.phone;
  let checkapps = await ApplicationModel.findOne({phone : phone});
  if(checkapps ){
    switch (checkapps.application_status) {
      case 'pending':
      res.redirect('/user/dashboard')
      break;
      case 'approved':
      res.redirect('/user/approvedapp')
      break;
      case 'rejected':
        res.redirect('/user/rejectedapp')
        break;         
    }
  }else{
      res.render('package')
    }
})
router.post('/package' , tokenauth, async (req , res) => {
let phone = req.user.phone;
let checkapps = await ApplicationModel.findOne({phone : phone});
console.log(phone);
console.log(checkapps);
if(checkapps ){
  res.send('you already have requested an application');
}else{

  let amount = req.body.amount;
  let duration = req.body.duration;
  res.render('signature' , {user : req.user , amount : amount , duration : duration})
}
})
router.post('/sign' , tokenauth, async (req , res) => {
const app = new ApplicationModel({
  amount : req.body.amount ,
  duration : req.body.duration ,
  phone : req.body.phone , 
  application_status : 'pending'
})
let result = await app.save();
console.log(result);
res.redirect('/user/dashboard')
})
router.get('/login' , (req , res)=>{
  res.render('login');
})
router.get('/admin' ,tokenauth, ensureAdmin, async(req , res)=> {
  let allapp  =await ApplicationModel.find({application_status : 'pending'})
if(allapp){
  res.render('adminhome' , {apps : allapp})
} else{res.render('adminhome')}
})
router.get('/approve/app/:id' , tokenauth , ensureAdmin , async(req , res) =>{
  let id  = req.params.id;
  let dt = Date.now();
  let approved = await ApplicationModel.findByIdAndUpdate(id , {application_status : 'approved' , approved_date : dt});
  console.log(dt);
  res.redirect('/user/admin')
})
router.get('/reject/app/:id' , tokenauth , ensureAdmin , async(req , res) =>{
  let id  = req.params.id;
  let approved = await ApplicationModel.findByIdAndUpdate(id , {application_status : 'rejected'});
  console.log(approved);
  res.redirect('/user/admin')
})
router.get('/view/app/:id' , tokenauth , ensureAdmin , async(req , res)=> {
  let id  = req.params.id;
  app = await ApplicationModel.findById(id);
  phone = app.phone;
  user = await Usermodel.find({phone : phone})
  console.log(user);
  let u = user[0];
res.render('viewapp' , {app : app , user: u})
})
router.get('/dashboard' , tokenauth , async (req , res)=> {
  let user = req.user.phone;
  let app = await ApplicationModel.find({phone : user});
  res.render('reviewapp' )
})

router.get('/rejectedapp' ,tokenauth , async(req , res)=> {
  res.render('rejectedapp')
})
router.get('/approvedapp' ,tokenauth , async(req , res)=> {
  let phone = req.user.phone;
  let app = await ApplicationModel.find({phone : phone})
  data = app[0];
  console.log(app);
  res.render('approvedapp' , {app : data})
} )
  module.exports = router;