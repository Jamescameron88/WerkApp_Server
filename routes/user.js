var express = require("express");
var router = express.Router();
var models = require("../models");
var authService = require("../services/auth");
const { BOOLEAN } = require("sequelize");

// create an account
router.post("/CreateAccount", function (req, res, next) {
  models.user
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
        IsScheduler: 0,
        IsDeleted: 0,
        Company: req.body.newProfile.company,
        Occupation: req.body.newProfile.occupation,
        Associates: "0",
        Requests: "0",
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
router.post("/Login", function (req, res, next) {
  models.user
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
router.get("/Profile", function (req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyPerson(token).then((user) => {
      if (user) {
        models.user
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
router.get("/Search", function (req, res, next) {
  models.user.findAll().then((person) => {
    res.json({ person });
  });
});

// Get another user profile
router.get("/AssociateProfile/:id", function (req, res, next) {
  models.user.findByPk(parseInt(req.params.id)).then((user) => {
    res.json({ user });
    console.log({ user });
  });
});

router.put("/AssociateProfile/:id", function (req, res, next) {
  models.user
    .update(
      { requests: req.body.ListProfile.requests + ", " + req.body.Self.UserId },
      { where: { UserId: req.params.id } }
    )
    .then((updatedRequests) => {
      res.json(updatedRequests);
    })
    .catch((err) => res.json(err));
});

// Log Out
router.get("/Logout", function (req, res, next) {
  res.cookie("jwt", "", { expires: new Date(0) });
  res.json("Logged Out!!!");
});

module.exports = router;
