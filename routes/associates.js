var express = require("express");
var router = express.Router();
var models = require("../models");
var authService = require("../services/auth");
const { BOOLEAN } = require("sequelize");



//Send associate request
router.post("/AssociateProfile/:id", function (req, res, next) {
  console.log(typeof req.body.Self.UserId);
  models.Associates.findOrCreate({
    where: {
      a_UserID: req.body.Self.UserId,
      a_AssociateID: req.body.ListProfile.UserId,
    },
    defaults: {
      a_UserID: req.body.Self.UserId,
      a_AssociateID: req.body.ListProfile.UserId,
      RequestStatus: "new",
    },
  }).spread(function (result, created) {
    if (created) {
      res.json("Sent Request");
      console.log("Sent Request");
    } else {
      res.json({ message: "You Are Already An Associate" });
    }
  });
//   console.log(req.body.Self.UserId);
});

//Get list of my associate requests
router.post("/Notifications", function (req, res, next) {
  models.Associates.findAll({
    where: {
      a_UserID: req.body.profile.UserId,
      RequestStatus: "new",
    },
  }).then((myRequests) => {
    res.json({ myRequests });
    console.log(myRequests);
  });
});

module.exports = router;
