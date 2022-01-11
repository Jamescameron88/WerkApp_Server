var express = require("express");
var router = express.Router();
var models = require("../models");
var authService = require("../services/auth");
const { BOOLEAN } = require("sequelize");




//Send associate request
router.post("/AssociateProfile/:id", function (req, res, next) {
  console.log(typeof req.body.Self.UserId);
  models.businessassociate.findOrCreate({
    where: {
      a_Users_UserId: req.body.Self.UserId,
      b_Users_UserId: req.body.ListProfile.UserId,
    },
    defaults: {
      a_Users_UserId: req.body.Self.UserId,
      b_Users_UserId: req.body.ListProfile.UserId,
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
router.post("/Notifications", async (req, res, next) => {
  try {
    const happyResult =  await models.businessassociate.findAll({
    where: {
      b_Users_UserId: req.body.profile.UserId,
      RequestStatus: "new",
    },
    attributes: {
      exclude: ['id', 'createdAt', 'updatedAt']
    },
    include: {
      model: models.user,
      attributes: ['UserId', 'FirstName', 'Email']
    }
  });
    res.json({ happyResult });
    console.log(happyResult);
  } catch (err) {
  console.error(err.message);
  res.status(500).send('Server Error');
}
});




module.exports = router;
