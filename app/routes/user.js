const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Storage = require('../models/Storage');
const Auth = require('../../config/auth');
const config = require('../../config/db');
const GeneralCapacity = require('../models/GeneralCapacity');
require('dotenv').config();
const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const {
    G_USER,
    CLIENT_ID,
    CLIENT_SECRET,
    REFRESH_TOKEN,
    REDIRECT_URL } = process.env
const oauth2Client = new OAuth2(
    CLIENT_ID, // ClientID
    CLIENT_SECRET, // Client Secret
    REDIRECT_URL // Redirect URL
);
oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN
});
const access_Token = oauth2Client.getAccessToken()
let transporter = nodemailer
    .createTransport({
        service: 'Gmail',
        auth: {
            type: 'OAuth2',
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET
        }
    });
transporter.on('token', token => {
    console.log('A new access token was generated');
    console.log('User: %s', token.user);
    console.log('Access Token: %s', token.accessToken);
    console.log('Expires: %s', new Date(token.expires));
});

async function sendMail(user) {
    try {
        const port = process.env.PORT || 5000
        let server = ""
        { process.env.server ? server = `${process.env.server}api/user/activation/${user._id}` : server = `http://localhost:${port}/api/user/activation/${user._id}` }
        const mailOptions = {
            from: `StorageChain <${G_USER}>`,
            to: user.Email,
            subject: 'Verify Email',
            text: 'Welcome To Storage Chain Family',
            html: `<center><h1>HI ${user.FullName}</h1><br/><a href=${server}><button Style="border-radius: 12px; background-color:#00bbff;  font-size: 16px; margin: 4px 2px;  border: none; color: white; padding: 20px; text-align: center;width:120px;cursor: pointer;" > Please press Here to verify Your Email</button></center>`,
            auth: {
                user: G_USER,
                refreshToken: REFRESH_TOKEN,
                accessToken: access_Token,
                expires: 1494388182480
            }
        };
        const result = await transporter.sendMail(mailOptions, (error, response) => {
            error ? console.log(error) : console.log(response);
            transporter.close();
            return response
        });
        return result;
    } catch (error) {
        return error;
    }
}

//----------------------- All Post request ----------------------------\\
//this rout response to register a new user
router.post('/api/User/register', (req, res) => {
    let newCapacity
    GeneralCapacity.find({}, async (err, foundCapacity) => {
        const { FullName, CompanyName, NationalId, Phone, Email, password, Role, SubscriptionPlan } = req.body
        const user = {}
        user.FullName = FullName,
            user.CompanyName = CompanyName,
            user.NationalId = NationalId,
            user.Phone = Phone,
            user.Email = Email,
            user.password = password,
            user.Role = Role,
            user.SubscriptionPlan = SubscriptionPlan
        const newUser = new User(user)
        const date = new Date()
        const stor = {}
        stor.BelongTo = newUser._id,
            stor.StorageType = SubscriptionPlan
        if (SubscriptionPlan === "Primary") {
            stor.SubscriptionStorageArea = 50
            stor.StorageArea = 0
            newCapacity = foundCapacity[0].TotalCapacity - stor.SubscriptionStorageArea
            await foundCapacity[0].updateOne({ TotalCapacity: newCapacity });
        }
        else if (SubscriptionPlan === "Premium") {
            stor.SubscriptionStorageArea = 100
            stor.StorageArea = 0
            newCapacity = foundCapacity[0].TotalCapacity - stor.SubscriptionStorageArea
            await foundCapacity[0].updateOne({ TotalCapacity: newCapacity });
        } else {
            stor.StorageArea = 0
        }
        stor.EndOfSubscription = SubscriptionPlan === "Primary" ? EndOfSubscription = new Date(date.setMonth(date.getMonth() + 1))
            : SubscriptionPlan === "Premium" ? EndOfSubscription = new Date(date.setMonth(date.getMonth() + 12))
                : 0
        stor.StorageCapacity = foundCapacity[0]._id
        const newStorage = new Storage(stor)
        newUser.StorageId = newStorage._id
        newStorage.save()
        User.addUser(newUser, (err, addedUser) => {
            console.log(addedUser);
            if (err) {
                let message = "";
                console.log(err.errors);
                if (err.errors.Email) message = "Email ALready Exists";
                if (err.errors.CompanyName) message = "Please Make Sure To Company Name is required"
                // else message = "Please Make Sure To Fill The Form Accurately";
                return res.json({
                    success: false,
                    message
                });
            } else {
                sendMail(newUser)
                    .then((result) => console.log('Email sent...', result))
                    .catch((error) => console.log(error.message));
                res.status(200).json({
                    success: true,
                    message: "User registration is successful."
                });
            }
        });
    });
});
router.post('/api/User/login', (req, res) => {
    const Email = req.body.Email;
    const password = req.body.password;

    User.getUserByEmail(Email, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({
                success: false,
                message: "Ath failed"
            });
        }
        User.UserPassword(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch && user.Active === false) {
                sendMail(user)
                    .then((result) => console.log('Email sent...', result))
                    .catch((error) => console.log(error.message));
                return res.json({
                    success: false,
                    message: "Please Check Your Email For Activation Message"
                });
            }
            if (isMatch && user.Active === true) {
                const token = jwt.sign({
                    type: "login data",
                    data: {
                        _id: user._id,
                        FullName: user.FullName,
                        Email: user.Email,
                        Phone: user.Phone,
                        Role: user.Role,
                        StorageId: user.StorageId
                    }
                }, config.database.secret, {
                    expiresIn: "5h"
                });
                return res.status(200).json({
                    success: true,
                    token: token
                });
            } else {
                return res.status(401).json({
                    success: false,
                    message: "Ath failed"
                });
            }
        });
    });
});

//======================================
router.get('/api/user/activation/:id', async (req, res) => {
    User.findById(req.params.id, async (error, foundUser) => {
        if (foundUser.Active === false) {
            try {
                await foundUser.updateOne({ Active: true })
                    .exec((err, User) => {
                        if (err) {
                            res.status(500).send(err);
                            return;
                        }
                        else {
                            res.redirect('https://vex-xcc.github.io/infinite-loop/#/SignIn');
                        }
                    })
            } catch (error) {
                res.status(404).json(error);
            }
        } else {
            res.redirect('http://google.com');;
        }
    }
    )
});
//================================== =======================================//
router.patch('/api/Update/User/by/:id', (req, res) => {
    User.findById(req.params.id, async (error, foundUser) => {
      try {
        await foundUser.updateOne(req.body);
        res.status(200).json(req.body);
      } catch (error) {
          console.log(error);
        res.status(404).json(error);
      }
    });
  });
//================================
router.get('/api/get/all/user/Customer', (req, res) => {
    User.find({})
        .where('Role')
        .in('Customer')
        .select('FullName CompanyName Email Phone -_id')
        .exec((err, User) => {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.status(200).json(User);
        })
});
router.get('/api/Find/User/By/:id', (req, res) => {
    User.findById(req.params.id)
        .exec((err, User) => {
            if (err) {
                res.status(500).send(err);
                return;
            }
            res.status(200).json(User);
        });
});

module.exports = router;
