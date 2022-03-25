var express = require("express");
var router = express.Router();
const { check, validationResult } = require('express-validator');
var models = require("../models");
var authService = require("../services/auth");
// const { BOOLEAN } = require("sequelize");
const { Sequelize, Op } = require("sequelize");
const { sequelize } = require("../models");
const shifts = require("../models/shifts");


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
  try {
    let availableShifts = await models.availableshifts.findAll({
      attributes: [
        'ShiftShiftId'
      ],
      where: {
        UserUserId: req.params.id
      }, 
      include: [
        { model: models.shifts,
          attributes: [
            'UserUserId',
            'Company',
            'DateDay'
          ],
          include: [
            {
              model: models.user,
              attributes: [
                'ProfilePicURL'
              ]
            }
          ]
        },
      ],
      raw: true,
    });
    
    var str = JSON.stringify(availableShifts);
    str = str.replace(/ShiftShiftId/g,'JJobId');
    str = str.replace(/Shift.UserUserId/g,'SchedulerId');
    str = str.replace(/Shift.Company/g,'Company');
    str = str.replace(/Shift.DateDay/g,'Date');
    str = str.replace(/Shift.User.UserId/g,'JJobId2');    
    str = str.replace(/Shift.User.ProfilePicURL/g,'SchedulerProfilePicURL');


    // console.log(str);

    const availableShifts2 = JSON.parse(str);


    // var newAvailableShifts = [{
    //   JJobId: availableShifts[0].ShiftShiftId,
    //   SchedulerId: "Trey",
      // Company: availableShifts[0].['Shift.Company'],
      // Date: availableShifts[0].Shift.DateDay,
      // SchedulerProfilePicURL: availableShifts[0].Shift.User.SchedulerProfilePicURL
    // }]
    // console.log(availableShifts[0]);

    // res.json({ availableShiftsArray });
    // console.log(newAvailableShifts)
    res.json(availableShifts2);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})


  module.exports = router;