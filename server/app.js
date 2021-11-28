const express = require('express');
const cors = require("cors");
const jwt=require('jsonwebtoken');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const classRoutes = require('./routes/classRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const publicPath = path.join(__dirname,'public')
const templateDirPath = path.join(__dirname,'views')

app.use(express.static(publicPath))
app.set('view engine' ,'ejs')
app.set('views' , templateDirPath)
app.use(cors());
app.use(cookieParser());
app.use(express.json({limit : '50mb'}));
app.use(express.urlencoded({ extended: true , limit: '50mb' }))
app.use(userRoutes);
app.use(classRoutes);
app.use(assignmentRoutes);

// connect database
const db = process.env.dbURI

mongoose.connect( db,{
    useNewUrlParser: true,
    useUnifiedTopology : true
});

const port = process.env.PORT || 5000

app.get('/',  (req,res) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.jwt_secret, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        res.render('login')
      } else {
        // let user = await User.findById(decodedToken.id);
        // res.locals.user = user;
        res.redirect('/class')
      }
    });
  } else {
    res.render('login')
  }
})

app.get('*' , function(req , res){
  res.render('error')
})

app.listen(port,() => {
    console.log('Server is running on port, ' ,port)
})