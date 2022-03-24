var express = require("express");
var router = express.Router();
const { check, validationResult } = require('express-validator');
var models = require("../models");
var authService = require("../services/auth");
// const { BOOLEAN } = require("sequelize");
const { Sequelize, Op } = require("sequelize");
const { sequelize } = require("../models");


// @route   POST
// @descr   Create a job (header)
// @access  PRIVATE (TODO)
router.post("/CreateShift", async (req, res) => {
  var createAShift = [];
  try { 
        createAShift = await models.shifts.findOrCreate({
          where: {
            ShiftIdentifier: req.body.newShift.ShiftIdentifier,
            DateDay: req.body.newShift.DateDay,
            StartDateTime: req.body.newShift.StartDateTime,
            FinishDateTime: req.body.newShift.FinishDateTime,
            Company: req.body.newShift.Company,
            Location: req.body.newShift.Location,
            Pay: req.body.newShift.Pay,
            ShiftNotes: req.body.newShift.ShiftNotes,  
            UserUserId: req.body.newShift.UserUserId,
            NumberOfWerkers: req.body.newShift.NumberOfWerkers
          },
        })
      res.json({ "ShiftId":createAShift[0].dataValues.ShiftId });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
  

// @route   POST
// @descr   Publish a job (make it available) to selected associates
// @access  PRIVATE (TODO)
router.post("/PublishJob", async (req, res) => {
  try {  
  for (let i = 0; i < req.body.MyCrew.Crew.length; i++) {
    console.log({"crew member":req.body.MyCrew.Crew[i]});

    let publishJob = await models.availableshifts.findOrCreate({
      where: {
        UserUserId: req.body.MyCrew.Crew[i],
        ShiftShiftId: req.body.MyCrew.JobJobID.id
      },
    })
  }
  res.json({schedulersAssociates});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
  

//  @route  GET
//  @descr  Get a list of the jobs that are available for the logged in werker
//  @access PRIVATE (TODO)
router.get("/AvailableShifts/:id", async (req, res) => {
  var availableShiftsArray = [];
  try {
    let availableShifts = await models.availableshifts.findAll({
      where: {
        UserUserId: req.params.id
      }, 
      include: models.shifts
    });

    console.log(JSON.stringify(availableShifts.length));

    let x = 0;
    for (let i = 0; i < availableShifts.length; i++) {

      console.log(JSON.stringify(availableShifts[i].Shift.ShiftId));

      let singleShift = await models.usershifts.findAndCountAll({
        where: {
          ShiftShiftId: availableShifts[i].Shift.ShiftId
        }
      })

      console.log(availableShifts[i].Shift.NumberOfWerkers);
      console.log(singleShift.count);
      console.log(availableShifts[i].Shift.NumberOfWerkers - singleShift.count);

      if (availableShifts[i].Shift.NumberOfWerkers - singleShift.count > 0) {
        console.log("there is an available shift");
        availableShiftsArray[x] = availableShifts[i];
        x++;
      } else {
        console.log("no shifts available")
      }
    }

    console.log(JSON.stringify(availableShiftsArray));

    res.json({availableShiftsArray});

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})


  module.exports = router;