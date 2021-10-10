const express = require('express');
const router =express.Router();
const News = require('../models/News');
const User = require('../models/User');
const {upload,fileUpload} = require('../../config/helperMethod');
const Auth = require('../../config/auth');
const fs = require('fs')
require("dotenv");


//============================ Post routers ============================\\
router.post('/api/post/:PostBy',Auth.auth.checkTeamLeaderOrSuper, upload.fields([{ name: 'Banner', maxCount: 1 }, { name: 'img', maxCount: 5 }]), (req, res) => {
   const PostBy  =req.params.PostBy
   const Title   =req.body.Title
   const Content =req.body.Content 
   const isNews  = true 
  const news = {
    PostBy,
    Title,
    Content,
    isNews
  };
  if (req.files['img']) {
    const img     =req.files['img'][0].path
      news.img = img;
  }
  if (req.files['Banner']) {
    const Banner     =req.files['Banner'][0].path
      news.Banner = Banner;
  }
  const savedNews = new News(news) 
    User.findById(req.params.PostBy, async (error, foundUser) => {
      try {
        if(foundUser.Role == "Superintendent"){
          await foundUser.Post.push(savedNews);
          savedNews.save()
          foundUser.save()
          res.status(200).json(savedNews);
        }else if(foundUser.Role == "TeamLeader"){
          await foundUser.Post.push(savedNews);
          savedNews.save()
          foundUser.save()
          res.status(200).json(savedNews);
        }
      else{
        res.status(404).send({error: "Unauthorized"})
      }}
      catch (error) {
        res.status(404).json(error);
      }
    });
  });

//===================================================
router.post('/api/upload/new/Police/:PostBy',Auth.auth.checkTeamLeaderOrSuper, fileUpload.single('file'), (req, res) => {
  const PostBy  =req.params.PostBy
  const Title   =req.body.Title
  const isNews  =false 
  const news = {
   PostBy,
   Title,
   isNews
 };
 console.log(req.file);
 if (req.file) {
   const file  =req.file.path
     news.File = file;
     console.log(req.file.path);
 }
 console.log(news)
const savedNews = new News(news) 
   User.findById(req.params.PostBy, async (error, foundUser) => {
     try {
       if(foundUser.Role == "Superintendent"){
         await foundUser.Post.push(savedNews);
         savedNews.save()
         foundUser.save()
         res.status(200).json(savedNews);
       }else if(foundUser.Role == "TeamLeader"){
         await foundUser.Post.push(savedNews);
         savedNews.save()
         foundUser.save()
         res.status(200).json(savedNews);
       }
     else{
       res.status(404).send({error: "Unauthorized"})
     }}
     catch (error) {
       res.status(404).json(error);
     }
   });
 });
  //============================  GET routers ============================\\
  //==============get all News ================\\
  router.get('/api/get/All/News', (req, res) => {
    News.find({})
    .where('isNews').in(true)
    .exec((err, News) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      res.status(200).json(News);
    })
})

router.get('/api/get/All/Polices', (req, res) => {
  News.find({})
  .where('isNews').in(false)
  .exec((err, News) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.status(200).json(News);
  })
})
//=============== get News By ID =================\\
router.get('/api/getNewsById/:id', (req, res) => {
News.findById(req.params.id)
.exec((err, News) => {
  if (err) {
    res.status(500).send(err);
    return;
  }
  res.status(200).json(News);
});
});

//=============== Update News By ID =================\\
router.patch('/api/Update/NewsBy/:id' ,Auth.auth.checkSuperintendent, upload.single('img'), (req,res) =>{
  News.findById(req.params.id, async (error, foundNews) => {
    try{
const news = {
 
};
      if(req.body.Title){
        const Title = req.body.Title
        news.Title = Title
      }
      if(req.body.Content){
        const Content = req.body.Content
        news.Content = Content
      }
if (req.file) {
  //to Upload new photo
 const img     =req.file.path
   news.img = img;
   //To remove Old Photo
   await  fs.unlink(foundNews.img, (err) => {
    if (err) {
      console.error(err)
      return
    }
  })
}
await foundNews.update(news)      
          res.status(200).json(req.body)
        }
    catch(error){
      res.status(401).send("Update Failed");
    }
  })
  })

  //============================//
  router.patch('/api/Update/News/state/:id' ,Auth.auth.checkSuperintendent, upload.single('img'),async (req,res) =>{
    try{
      await News.findOneAndUpdate({_id:req.params.id, InHomePage:false, new: true})  
            res.status(200).json({success: "updated successfully"})
          }
      catch(error){
        res.status(401).send("Update Failed");
      }
    })
//=============== Delete News By ID =================\\
router.delete('/api/delete/newsBy/:id', Auth.auth.checkSuperintendent,(req, res) => {
  News.findById(req.params.id, async (error, foundNews) => {
    try {
      await foundNews.remove();
      await  fs.unlink(foundNews.img, (err) => {
        if (err) {
          console.error(err)
          return
        }
      })
      res.status(200).json(`News Id:  ${req.params.id} has been deleted `);
    } catch (error) {
      res.status(404).json({
        error: {
          name: 'DocumentNotFound',
          massage: 'The provided ID dose not match any Document on News'
        }
      });
    }
  });
});
  module.exports = router;