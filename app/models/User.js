const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const validateEmail = function (Email) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(Email)
};
const UserSchema = mongoose.Schema({
  FullName: {
    type: String,
    required: [true, 'Full Name required'],
  },
  CompanyName:{
    type: String,
    required: [true, 'Company Name required'],
  },
  NationalId: {
    type: String,
    minlength: [10, 'Please inter correct  NationalId'],
    maxlength: [10, 'Please inter correct  NationalId'],
    required: [true, 'NationalId is required'],
  },
  Phone: {
    type: String,
    required: [true, 'phone number required']
  },
  Email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: 'Email address is required',
    validate: [validateEmail, 'Please fill a valid email address'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password required']
  },
  StorageId: {
    type: Schema.Types.ObjectId,
    ref: 'Storage'
},
  Role: {
    type: String,
    required: [true, 'User Type is required'],
    enum: {
      values: ["Customer","StorageAdmin"],
      message: '{VALUE} is not supported',
    },
  },
  SubscriptionPlan:{
    type: String,
    required: [true, 'User Type is required'],
    enum: {
      values: ["Daily","Primary","Premium"],
      message: '{VALUE} is not supported',
    },
  },
  Active:{
    type: Boolean,
    required:true,
    default:false
  },
  RegAt:{
    type: Date, default: Date.now
} 
});
UserSchema.plugin(uniqueValidator);

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = (id, callback) => {
  User.findById(id, callback);
}

//create and export function to  Find the Employee by Its Email
module.exports.getUserByEmail = (Email, callback) => {
  const query = {
    Email: Email
  }
  User.findOne(query, callback);
}

// create and export function to Register the User
module.exports.addUser =   (newUser, callback) =>{
  bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser.save(callback);
      })
  });
}

//create and export function to  user the  Password
module.exports.UserPassword = (password, hash, callback) => {
  bcrypt.compare(password, hash, (err, isMatch) => {
    if (err) throw err;
    callback(null, isMatch);
  });
}
