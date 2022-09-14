var express = require("express");
var router = express.Router();
const { check, validationResult } = require('express-validator');
var models = require("../models");
var authService = require("../services/auth");
// const { BOOLEAN } = require("sequelize");
const { Sequelize, Op } = require("sequelize");
const { sequelize } = require("../models");


// @route   POST
// @descr   Create a user account
// @access  PUBLIC
router.post("/CreateAccount", [
  check('newProfile.FirstName', 'First Name is required').not().isEmpty(),
  check('newProfile.LastName', 'Last Name is required').not().isEmpty(),
  check('newProfile.Email', 'Please include a valid email').isEmail(),
  check('newProfile.Password', 'Please enter a password with 2 or more characters').isLength({ min:2 })
], async (req, res) => {    
  
  const errors = validationResult(req);
  console.log(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const [userData, created] = await models.user.findOrCreate({
      where: {
        Email: req.body.newProfile.Email,
      },
      defaults: {
        FirstName: req.body.newProfile.FirstName,
        LastName: req.body.newProfile.LastName,
        Email: req.body.newProfile.Email,
        Username: req.body.Username,
        Password: req.body.newProfile.Password,
        IsScheduler: 0,
        IsDeleted: 0,
        Company: req.body.newProfile.Company,
        Occupation: req.body.newProfile.Occupation,
        ProfilePicURL: "../assets/profilePic.png",
        UserBio: "Fill out this bio to tell others about yourself"
      }
    });
    if (created) {
      res.json({ message: "Created Profile!" });
      console.log("Created Profile");
    } else {
      res.json({ message: "This Account Already Exists" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');    
  }
});


// @route   POST
// @descr   Login to a user account
// @access  PUBLIC
router.post("/Login", [
  check('logProfile.Email', 'Please include a valid email').isEmail(),
  check('logProfile.Password', 'Please enter your password').not().isEmpty()
], async (req, res) => {
  
  const errors = validationResult(req);
  // console.log(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const loginUser = await models.user.findOne({
      where: {
        Email: req.body.logProfile.Email,
      }
    })
    if (!loginUser) {
      console.log('Person not found')
      res.json("Person not found")
      // res.status(401).json({ message: "Login Failed"})
    } else {
       const authUser = await models.user.findOne({
        where: { [Op.and]: [
          { Email: req.body.logProfile.Email },
          { Password: req.body.logProfile.Password }
        ]}
      })
      if (authUser) {
        let token = authService.signPerson(authUser);
        res.cookie("jwt", token, {
          httpOnly: true,
          secure: true
        });
        res.json(token);
      } else {
        console.log("Wrong Password");
        res.json("Wrong Password")
      }
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET
// @descr   Get the Profile data
// @access  PRIVATE
router.get("/Profile", async (req, res) => {
  try {
    let token = req.cookies.jwt;
    if (token) {
      const authUser = await authService.verifyPerson(token); 
      if (authUser) {
        const personDataFound = await models.user.findOne({
          where: {
            UserId: authUser.UserId,
          }
        })
        res.json({ personDataFound })
      } else {
        res.status(401);
        res.json("Must be logged in");
      } 
    } else {
      console.error("No token found")
      res.status(500).send('No token in the cookie')
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET
// @descr   Get a list of users except for current user
// @access  PRIVATE
router.get("/Search/:id", async (req, res) => {
  try {
    let token = req.cookies.jwt;
    if (token) {
      const authUser = await authService.verifyPerson(token); 
      if (authUser) {
          const personArray = await models.user.findAll({
            where: {
              UserId: { [Op.not]: req.params.id }
            }
          });
          res.json({ personArray });
        } else {
          res.status(401);
          res.json("Must be logged in");
        }
    }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error')
    }
  });


// @route   GET
// @descr   Get another user's profile
// @access  PRIVATE
router.get("/AssociateProfile/:id", async (req, res) => {
  try {
    let token = req.cookies.jwt;
    if (token) {
      const authUser = await authService.verifyPerson(token); 
      if (authUser) {
        const user = await models.user.findByPk(parseInt(req.params.id));
        res.json({ user });
        } else {
          res.status(401);
          res.json("Must be logged in");
        }
    }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error')
    }
  });


// @route   GET
// @descr   Log out auth user
// @access  PUBLIC
router.get("/Logout", function (req, res, next) {
  try {
    res.cookie("jwt", "", { expires: new Date(0) });
  res.json("Logged Out!!!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// ====================== TESTING ======================


// @route   GET
// @descr   Get the Profile data
// @access  PUBLIC (for testing)
router.get("/PublicProfile", async (req, res) => {
  try {
    const personDataFound = await models.user.findOne({
      where: {
        UserId: req.body.UserId
      }
    });
    res.json({ personDataFound }); 
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });


// @route   PUT
// @descr   Edit user profile
// @access  PUBLIC (for testing)
router.put("/PublicUpdateUserProfile/:id", async (req, res) => {
  try {
    const { FirstName, LastName, Email, Username, Company, Occupation, UserBio } = req.body.editProfile;
    
    const profileRecord = await models.user.update(
      { 
        FirstName,
        LastName,
        Email,
        Username,
        Company,
        Occupation,
        UserBio
      },
      { where: {
          UserId: req.params.id
        }
    });

    const EditProfile = await models.user.findOne({
      where: {
        UserId:req.params.id
      }
    })

    res.json({ EditProfile });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;