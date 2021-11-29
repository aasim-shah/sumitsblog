const express = require('express')
const conn = require('./db/conn')
const Usermodel = require('./models/userModel')
const Planmodel = require('./models/applicationModel')
const userRouter = require('./routers/userrouter')
const session = require('express-session')
const path = require('path')
const bodyParser = require('body-parser')
var jwt = require('jsonwebtoken');
const http = require('http');
const ejs = require('ejs')
const app = express()
const multer  = require('multer')
const { config } = require('dotenv')
app.set('view engine' , 'ejs')
app.use(session({ secret: "cats" }));
app.use('/user' , userRouter)
// let static_path = path.join(__dirname +'/uploads')
let static_path = path.join(__dirname +'/uploads')
console.log(static_path);
app.use(express.static(static_path))
// app.use('/user/view',express.static(static_path))
console.log(static_path);

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')   
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)      
    }
})
const port = process.env.PORT || 3000;

app.get('/' , (req , res) => {
    
    res.send('<h2>  HOme page <h2>')

})
var upload = multer({ storage: storage });

// app.post('/profile', upload.array('image', 3), function (req, res, next) {
//     // req.files is array of `photos` files
//     console.log(req.files);
//     // req.body will contain the text fields, if there were any
//   })

  const cpUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'image1', maxCount: 1 }, {name : 'image2', maxCount:1}])
app.post('/profile', cpUpload, function (req, res, next) {
  // req.files is an object (String -> Array) where fieldname is the key, and the value is array of files
  //
  // e.g.
  //  req.files['avatar'][0] -> File
  //  req.files['gallery'] -> Array
  //
  // req.body will contain the text fields, if there were any
})

app.get('/profile', (req , res)=> {
    res.render('userdata2')
})
  
app.listen(port , () => {
    console.log(`server is running on ${port} at http://localhost:${port}`);
})