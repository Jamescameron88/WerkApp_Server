var express = require("express");
var router = express.Router();
var models = require("../models");
var authService = require("../services/auth");
const { BOOLEAN } = require("sequelize");


// @route   POST
// @descr   Create a user account
// @access  PUBLIC
router.post("/CreateAccount", async (req, res) => {  
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
router.post("/Login", async (req, res) => {
  try {
    const loginUser = await models.user.findOne({
      where: {
        Email: req.body.logProfile.Email,
      }
    })
    if (!loginUser) {
      console.log('Person not found')
      res.status(401).json({ message: "Login Failed"})
    } else {
      const authUser = await models.user.findOne({
        where: { 
          Email: req.body.logProfile.Email,
          Password: req.body.logProfile.Password
        }
      })
      if (authUser) {
        let token = authService.signPerson(authUser);
        res.cookie("jwt", token);
        res.json(token);
      } else {
        console.log("Wrong Password");
      }
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET
// @descr   Get the Profile data
// @access  PRIVATE (TODO)
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
          if (personDataFound) {
            res.json({ personDataFound})
          } else {
            res.status(401);
            res.json("Must be logged in");
          }
        }
      }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
});


// @route   GET
// @descr   Get a list of all the users
// @access  PRIVATE (TODO)
router.get("/Search", async (req, res) => {
  try {
    const peopleProfileData = await models.user.findAll();
    console.log(peopleProfileData);
    res.json({ peopleProfileData });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
});


// @route   GET
// @descr   Get another user's profile
// @access  PRIVATE (TODO)
router.get("/AssociateProfile/:id", async (req, res) => {
try {
  const user = await models.user.findByPk(parseInt(req.params.id));
  res.json({ user });
  console.log(user);
} catch (err) {
  console.error(err.message);
  res.status(500).send('Server Error');
}
});


// @route   GET
// @descr   Log out auth user
// @access  PRIVATE (TODO)
router.get("/Logout", function (req, res, next) {
  try {
    res.cookie("jwt", "", { expires: new Date(0) });
  res.json("Logged Out!!!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// ================== PRACTICE ================== 


// // Search Users, but exclude current user
router.get("/Search/:id", async (req, res) => {
  try {
    const personArray = await models.user.findAll();
    console.log(JSON.stringify(personArray));

    // finds the index of the UserId in the personArray
    var indexPosition = personArray.findIndex(function(item, i){
      return item.UserId === req.params.id // need to replace the 4 with the req.params
    });

    personArray.splice(indexPosition, 1);

    console.log(JSON.stringify(personArray));

    res.json(personArray);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
