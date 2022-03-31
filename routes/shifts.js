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
      attributes: [['ShiftShiftId','JJobId']],
      where: {
        UserUserId: req.params.id,
      }, 
      include: [
        { model: models.shifts,
          attributes: [
            ['UserUserId','SchedulerId'],
            'Company',
            'NumberOfWerkers',
            ['DateDay','Date']
          ],
          include: [
            {
              model: models.user,
              attributes: [
                ['UserId','JJobId2']
                ,['ProfilePicURL','SchedulerProfilePicURL']
              ]
            }
          ]
        },
      ],
      raw: true,
    });

    var str = JSON.stringify(availableShifts);
    str = str.replace(/Shift.User./g,'');
    str = str.replace(/Shift./g,'');
    var availableShifts2 = JSON.parse(str);

    var shiftCheckArray = [];
    x = 0;
    for (let i = 0; i < availableShifts.length; i++) {
      let availableShiftsCount = await models.usershifts.findAll({
        where: {
          ShiftShiftId: availableShifts2[i].JJobId
        }, 
        raw: true
      });

      console.log(availableShifts2[i].JJobId);
      console.log(availableShifts2[i].NumberOfWerkers);
      console.log(availableShiftsCount.length);
      console.log(availableShifts2[i].NumberOfWerkers - availableShiftsCount.length);

      if (availableShiftsCount[0] == null) {
        console.log('null, no werkers have taken any shifts');
        shiftCheckArray[x] = availableShifts2[i];
        x++;
      } else if (availableShiftsCount[0].UserUserId = req.params.id) {
        console.log('user already has this shift - not available for him');
      } else if (availableShifts2[i].NumberOfWerkers - availableShiftsCount.length > 0) {
        shiftCheckArray[x] = availableShifts2[i];
        x++;
      } else {
        console.log('this probably shouldnt have happened');
      }};

    console.log(shiftCheckArray);
    availableShifts2 = shiftCheckArray;

    res.json({availableShifts2});
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET
// @descr   Retrieve shift details
// @access  PRIVATE (TODO)
router.get("/ShiftDetails/:id", async (req, res) => {
  try {  
    let werkShift = await models.shifts.findOne({
      where: {
        ShiftId: req.params.id
      },
    })
    res.json({ werkShift });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   POST
// @descr   Werker claim a shift
// @access  PRIVATE (TODO)
router.post("/WerkShift/", async (req, res) => {
  try {  
  
    console.log(req.body);
    let werkShift = await models.usershifts.findOrCreate({
      where: {
        UserUserId: req.body.werkJob.UserId,
        ShiftShiftId: req.body.werkJob.ShiftId
      },
    })

    res.json({ werkShift });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET
// @descr   Get list of jobs that a Werker has coming up
// @access  PRIVATE (TODO)
router.get("/MyScheduledJobs/:id", async (req, res) => {
  try {  
  
    console.log(req.params.id);

    let scheduledShifts = await models.usershifts.findAll({
      // attributes: [['ShiftShiftId']],
      where: {
        UserUserId: req.params.id,
        ShiftStatus: null
      }, 
      include: [
        { model: models.shifts,
          attributes: [
            ['UserUserId','SchedulerId'],
            'Company',
            'NumberOfWerkers',
            ['DateDay','Date']
          ],
          include: [
            {
              model: models.user,
              attributes: [
                ['UserId','JJobId2']
                ,['ProfilePicURL','SchedulerProfilePicURL']
              ]
            }
          ]
        },
      ],
      raw: true,
    });

    var str = JSON.stringify(scheduledShifts);
    str = str.replace(/Shift.User./g,'');
    str = str.replace(/Shift.SchedulerId/g,'SchedulerId');
    str = str.replace(/Shift.Company/g,'Company');
    str = str.replace(/Shift.NumberOfWerkers/g,'NumberOfWerkers');
    str = str.replace(/Shift.Date/g,'Date');

    var scheduledShifts2 = JSON.parse(str);

    console.log(scheduledShifts2);

    res.json({ scheduledShifts2 });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET
// @descr   Get list of past jobs for a Werker
// @access  PRIVATE (TODO)
router.get("/MyPastJobs/:id", async (req, res) => {
  try {  
  
    console.log(req.params.id);

    let pastShifts = await models.usershifts.findAll({
      // attributes: [['ShiftShiftId']],
      where: {
        UserUserId: req.params.id,
        ShiftStatus: !null
      }, 
      include: [
        { model: models.shifts,
          attributes: [
            ['UserUserId','SchedulerId'],
            'Company',
            'NumberOfWerkers',
            ['DateDay','Date']
          ],
          include: [
            {
              model: models.user,
              attributes: [
                ['UserId','JJobId2']
                ,['ProfilePicURL','SchedulerProfilePicURL']
              ]
            }
          ]
        },
      ],
      raw: true,
    });

    var str = JSON.stringify(pastShifts);
    str = str.replace(/Shift.User./g,'');
    str = str.replace(/Shift.SchedulerId/g,'SchedulerId');
    str = str.replace(/Shift.Company/g,'Company');
    str = str.replace(/Shift.NumberOfWerkers/g,'NumberOfWerkers');
    str = str.replace(/Shift.Date/g,'Date');

    var pastShifts2 = JSON.parse(str);

    console.log(pastShifts2);

    res.json({ pastShifts2 });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   PUT
// @descr   Update UserShift with werker status
// @access  PRIVATE (TODO)
router.put("/ShiftStatusUpdate/", async (req, res) => {
  try {  
  
    const werkerTest = await models.usershifts.update(
      { ShiftStatus: req.body.updateWerkerShiftStatus.UpdateStatus },
      { where: {
        UserUserId: req.body.updateWerkerShiftStatus.UserId,
        ShiftShiftId: req.body.updateWerkerShiftStatus.ShiftId
      }
    });

    res.json('Status updated');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   PUT
// @descr   Update UserShift when paid
// @access  PRIVATE (TODO)
router.put("/WerkerIsPaid/", async (req, res) => {
  try {  
  
    const werkerTest = await models.usershifts.update(
      { IsPaid: req.body.updateWerkerShiftStatus.IsPaid },
      { where: {
        UserUserId: req.body.updateWerkerShiftStatus.UserId,
        ShiftShiftId: req.body.updateWerkerShiftStatus.ShiftId
      }
    });

    res.json('Status updated');

    res.json({ werkerIsPaid });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


  module.exports = router;