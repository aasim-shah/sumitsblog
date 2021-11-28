const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const conn = require('../db/conn')

const userSchema = mongoose.Schema({
    email : {type : String   },
    password : {type : String   },
    first_name : {type : String   },
    middle_name :  {type : String  } ,
    last_name :  {type : String   },
    phone : {type : String },
    father_name :{type : String   },
    mother_name :{type : String   },
    dob : {type : String  },
    address : {type : String},
    state : {type : String   },
    city : {type : String   },
    pin_code : {type : String   },
    referrence1_name : {type : String },
    referrence1_contact : {type : String  },
    referrence2_name : {type : String },
    referrence2_contact : {type : String  },
    document_id : {type : String },
    image_1 : {type : String },
    image_2 : {type : String },
    image_3 : {type : String },
    video : {type : String  },
    bank_name :{type : String},
    account_holder_name :{type : String},
    ifsc_code :{type : String },
    account_number :{type : String   },
    isAdmin : String,


    tokens : [{

        token : {
            type : String,
            required : true
        }
    }
    ]
})

userSchema.methods.authuser =async function(){
     const jwttoken = jwt.sign({_id : this._id} , 'stgfingsecretkey')
     this.tokens = this.tokens.concat({token : jwttoken})
     await this.save()
     return jwttoken;
}
userSchema.methods.authuser_login = async function(){
     const jwttoken = jwt.sign({_id : this._id} , 'stgfingsecretkey')
     this.tokens = this.tokens.concat({token : jwttoken})
     return jwttoken;
}
const Usermodel = mongoose.model('users' , userSchema)

module.exports = Usermodel;