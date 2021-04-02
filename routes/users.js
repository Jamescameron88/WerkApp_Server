var express = require("express");
var router = express.Router();
var models = require("../models");
var authService = require("../services/auth");
const { BOOLEAN } = require("sequelize");

// create an account
router.post("/tab12", function (req, res, next) {
  models.person
    .findOrCreate({
      where: {
        Email: req.body.Email,
      },
      defaults: {
        FirstName: req.body.newProfile.FirstName,
        LastName: req.body.newProfile.LastName,
        Email: req.body.newProfile.Email,
        Username: req.body.Username,
        Password: req.body.newProfile.Password,
        isScheduler: 0,
        isDeleted: 0,
        company: req.body.newProfile.company,
        occupation: req.body.newProfile.occupation,
        associates: "",
      },
    })
    .spread(function (result, created) {
      if (created) {
        res.json("Created Profile!");
        console.log("Created Profile!");
      } else {
        res.json({ message: "This Account Already Exists" });
      }
    });
});

// login
router.post("/tab10", function (req, res, next) {
  models.person
    .findOne({
      where: {
        Email: req.body.logProfile.Email,
        Password: req.body.logProfile.Password,
      },
    })
    .then((user) => {
      if (!user) {
        console.log("Person not found");
        return res.status(401).json({
          message: "Login Failed",
        });
      }
      if (user) {
        let token = authService.signPerson(user);
        res.cookie("jwt", token);
        res.json(token);
      } else {
        console.log("Wrong password");
      }
    });
});

// get profile page
router.get("/tab5", function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyPerson(token).then((user) => {
      if (user) {
        models.person
          .findOne({
            where: {
              UserId: user.UserId,
            },
          })
          .then((personDataFound) => {
            res.json({ personDataFound });
          });
      } else {
        res.status(401);
        res.json("Must be logged in");
      }
    });
  }
});

// Search Users
router.get("/tab13", function (req, res, next) {
  models.person.findAll().then((person) => {
    res.json({ person });
  });
});

// Get another user profile
router.get("/tab14/:id", function (req, res, next) {
  models.person
    .findByPk(parseInt(req.params.id))
    .then((user) => {
      res.json({ user });
      console.log({ user });
    });
});

// Log Out
router.get("/tab11", function (req, res, next) {
  res.cookie("jwt", "", { expires: new Date(0) });
  res.json("Logged Out!!!");
});

module.exports = router;
