var express = require("express");
var router = express.Router();
const { check, validationResult } = require('express-validator');
var models = require("../models");
var authService = require("../services/auth");
// const { BOOLEAN } = require("sequelize");
const { Sequelize, Op } = require("sequelize");
const { sequelize } = require("../models");
const shifts = require("../models/shifts");
const usershifts = require("../models/usershifts");
const notificationsRoute = require("../routes/notifications");


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
    // console.log({"crew member":req.body.MyCrew.Crew[i]});

    let publishJob = await models.availableshifts.findOrCreate({
      where: {
        UserUserId: req.body.MyCrew.Crew[i],
        ShiftShiftId: req.body.MyCrew.JobJobID.id
      },
    })

    console.log("My Crew", req.body.MyCrew);

    let result3 = await publishJob;

    // console.log(result3);

  }

  // console.log("MultiKey : ", req.body.MyCrew.JobJobID.id);

  //  ****************** Setup the notification ******************
    //  1. Setup the notification object
    var notificationObject = {
      "newNotificationRecord": {
        "UserActionTypeId": 3,
        "UserUserId_actor": req.body.MyCrew.UserId,
        "UserUserId_notifier": req.body.MyCrew.Crew,
        "MultiKey": req.body.MyCrew.JobJobID.id
      }
    };
    //  2. Call the notification function
    const result = notificationsRoute.apiCreateNotificationRecord(notificationObject,"blank");
    //  ******************  Notification Done ******************




  // res.json({schedulersAssociates});
  res.json({"schedulersAssociates":3});
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
            ['DateDay','Date'],
            'Location',
            'Pay',
            'ShiftIdentifier'
          ],
          include: [
            {
              model: models.user,
              attributes: [
                ['UserId','JJobId2'],
                ['ProfilePicURL','SchedulerProfilePicURL'],
                'FirstName',
                'LastName',
                'ProfilePicURL'
              ]
            }
          ]
        },
      ],
      raw: true,
    });

    // check if the werker has already taken a job
    let x = 0;
    let newAvailableShifts = [];
    for (let i = 0; i < availableShifts.length; i++) {
      let findMeInAShift = await models.usershifts.findOne({
        where: { 
          UserUserId: req.params.id,
          ShiftShiftId: availableShifts[i].JJobId
        }
      });      
      if (findMeInAShift == undefined) {
        // console.log('null, werker has not taken shift: ' + availableShifts[i].JJobId);
        newAvailableShifts[x] = availableShifts[i];
        x = x + 1;
        // console.log(x);
      } else {
        // console.log('werker has taken shift: ' + availableShifts[i].JJobId);
      }
      findMeInAShift = undefined;
      // console.log(findMeInAShift);
    };

    var str = JSON.stringify(newAvailableShifts);
    str = str.replace(/Shift.User./g,'');
    str = str.replace(/Shift./g,'');
    var newAvailableShiftsA = JSON.parse(str);

    // check if there are any spots left on a shift
    let y = 0;
    let availableShifts2 = [];
    for (let i = 0; i < newAvailableShiftsA.length; i++) {
      let countShiftWerkers = await models.usershifts.findAll({
        where: {
          ShiftShiftId: newAvailableShiftsA[i].JJobId
        }
      });
      console.log(newAvailableShiftsA[i].NumberOfWerkers);


      if (newAvailableShiftsA[i].NumberOfWerkers - countShiftWerkers.length > 0) {
        availableShifts2[y] = newAvailableShiftsA[i];
        y = y + 1;
      }
    }
    
    res.json({availableShifts2});
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET
// @descr   Retrieve shift details for a Werker
// @access  PRIVATE (TODO)
router.get("/ShiftDetails/:id", async (req, res) => {
  try {  
    let werkShift2 = await models.shifts.findOne({
      where: {
        ShiftId: req.params.id
      },
      include: [
        { model: models.usershifts,
          attributes: [
            'IsPaid',
            'ShiftStatus',
          ],
        },
      ],
      raw: true,
    })

    var str = JSON.stringify(werkShift2);
    str = str.replace(/UserShifts./g,'');
    var werkShift = JSON.parse(str);

    console.log(werkShift);
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
      defaults: {
        IsPaid: false,
        ShiftStatus: "Scheduled"
      }
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
            ['DateDay','Date'],
            'Location',
            'Pay',
            'ShiftIdentifier'
          ],
          include: [
            {
              model: models.user,
              attributes: [
                ['UserId','JJobId2']
                ,['ProfilePicURL','SchedulerProfilePicURL'],
                'FirstName',
                'LastName',
                'ProfilePicURL'
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
    str = str.replace(/Shift.Location/g,'Location');
    str = str.replace(/Shift.Pay/g,'Pay');    
    str = str.replace(/Shift.ShiftIdentifier/g,'ShiftIdentifier');

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
    let pastShifts = await models.usershifts.findAll({
      // attributes: [['ShiftShiftId']],
      where: {
        UserUserId: req.params.id,
        ShiftStatus: 'Werked' || 'Cancelled'
      }, 
      include: [
        { model: models.shifts,
          attributes: [
            ['UserUserId','SchedulerId'],
            'Company',
            'NumberOfWerkers',
            ['DateDay','Date'],
            'Location',
            'Pay',
            'ShiftIdentifier'
          ],
          include: [
            {
              model: models.user,
              attributes: [
                ['UserId','JJobId2']
                ,['ProfilePicURL','SchedulerProfilePicURL'],
                'FirstName',
                'LastName',
                'ProfilePicURL'
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
    str = str.replace(/Shift.Location/g,'Location');
    str = str.replace(/Shift.Pay/g,'Pay');    
    str = str.replace(/Shift.ShiftIdentifier/g,'ShiftIdentifier');


    var pastShifts2 = JSON.parse(str);

    console.log(pastShifts2);

    res.json({ pastShifts2 });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   PUT
// @descr   Update UserShift with werker status (werked or cancelled)
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


//  @route  GET
//  @descr  Get a list of the Scheduler's jobs that still have open shifts
//  @access PRIVATE (TODO)
//  A Scheduler's Available Shifts are shifts that:
//    1. Have not been fully staffed
router.get("/SchedAvailableShifts/:id", async (req, res) => {

  try {
      let shiftInfo = await models.shifts.findAll({
        where: {
          UserUserId: req.params.id,
        }, 
        
        raw: true,
      });

    // get a list of scheduled workers
    let x = 0;
    let SchedAvailableJob = [];
    for (let i = 0; i < shiftInfo.length; i++) {

      let findOpenShifts = await models.usershifts.findAll({
        where: { 
          ShiftShiftId: shiftInfo[i].ShiftId,
          [Op.or]: [
            { ShiftStatus: "Scheduled" },
            { ShiftStatus: "Werked" }
          ]
          
          // ShiftStatus: "Scheduled" || "Werked"
        }
      });      

      // check if there are any unfilled shifts
      if (findOpenShifts == undefined) {
        console.log('found a null shift');
      } else if (shiftInfo[i].NumberOfWerkers - findOpenShifts.length == 0) {
        console.log('no room available in this shift');
      } else if (shiftInfo[i].NumberOfWerkers - findOpenShifts.length > 0) {
        console.log('found some shifts with room');
        SchedAvailableJob[x] = shiftInfo[i];
        x = x + 1;
      }
      findOpenShifts = undefined;
    };

    console.log(SchedAvailableJob);

    res.json({SchedAvailableJob});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET
// @descr   Retrieve shift details
// @access  PRIVATE (TODO)
router.get("/SchedShiftDetails/:id", async (req, res) => {
  
  //  get the shift details
  try {  
    let WerkShift = await models.shifts.findOne({
      where: {
        ShiftId: req.params.id
      }
    });

    //  get the werkers that are on the shift
    let Werkers = await models.usershifts.findAll({
      where: {
        ShiftShiftId: req.params.id
      },
    });

    var werkersInfoArray = [];
    var werkerShiftStatus = "Past";
    x = 0;
    for (let i = 0; i < Werkers.length; i++) {

      let werkerInfoData = await models.user.findOne({
        attributes: [
          'UserId',
          'FirstName',
          'LastName',
          'ProfilePicURL'
        ],
        where: {
          UserId: Werkers[i].UserUserId
        },
      })
      werkersInfoArray[i] = werkerInfoData;
      if (Werkers[i].ShiftStatus == "Werked") {
        //  this is ok
      } else {
        werkerShiftStatus = "Not Past"
      }

    };
    Werkers = werkersInfoArray;

    //  get the number of shifts still open

    // var openShifts = {};
    let OpenShifts = { 'unfilledshifts' : (WerkShift.NumberOfWerkers - Werkers.length) };



    //  Setup Shift Status =======================================================
    //  OpenShifts.ShiftStatus = "Pass the test"

    if (WerkShift.ShiftCancelled == 1) {
      OpenShifts.ShiftStatus = "Cancelled"
    } else if (OpenShifts.unfilledshifts > 0) {
      OpenShifts.ShiftStatus = "Open";
    } else if (OpenShifts.unfilledshifts == 0) {

        if (werkerShiftStatus == "Past") {
          OpenShifts.ShiftStatus = "Past";
        } else {
          OpenShifts.ShiftStatus = "Scheduled"
        }

    } else {
      OpenShifts.ShiftStatus = "Houston we have a problem";
    }

    //  Finish Shift Status =======================================================

    res.json({ WerkShift, Werkers, OpenShifts });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


//  @route  GET 
//  @descr  Get a list of the Scheduler's jobs that have been fully staffed
//  @access PRIVATE (TODO)
//  A Scheduler's Scheduled Shifts are shifts that:
//    1. Has been fully staffed
//    2. Hasn't occurred yet (meaning ALL scheduled workers haven't marked their shift as 'Werked')
router.get("/SchedScheduledShifts/:id", async (req, res) => {

  try {
      let shiftInfo = await models.shifts.findAll({
        where: {
          UserUserId: req.params.id,
        }, 
        
        raw: true,
      });

    // check if there are any unfilled shifts
    let x = 0;
    let SchedScheduledJob = [];
    for (let i = 0; i < shiftInfo.length; i++) {

      let findOpenShifts = await models.usershifts.findAll({
        where: { 
          ShiftShiftId: shiftInfo[i].ShiftId,
          ShiftStatus: "Scheduled"
        }
      });      

      if (findOpenShifts == undefined) {
        console.log('found a null shift');
      } else if (shiftInfo[i].NumberOfWerkers - findOpenShifts.length == 0) {
        console.log('this is a scheduled shift');
        SchedScheduledJob[x] = shiftInfo[i];
        x = x + 1;
      } else if (shiftInfo[i].NumberOfWerkers - findOpenShifts.length > 0) {
        console.log('this shift is still open');
      }
      findOpenShifts = undefined;
    };

    console.log(SchedScheduledJob);

    res.json({SchedScheduledJob});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


//  @route  GET
//  @descr  Get a list of the Scheduler's Past jobs
//  @access PRIVATE (TODO)
//  A Scheduler's Past Shifts are shifts that:
//    1. Has been fully staffed
//    2. Have occurred (meaning ALL scheduled workers have marked their shift as 'Werked')
router.get("/SchedPastShifts/:id", async (req, res) => {

  try {
      let shiftInfo = await models.shifts.findAll({
        where: {
          UserUserId: req.params.id,
        }, 
        raw: true,
      });

    // check each job to see if all shifts have been werked or cancelled.
    let x = 0;
    let SchedPastJob = [];
    for (let i = 0; i < shiftInfo.length; i++) {

      let findPastShifts = await models.usershifts.findAll({
        where: { 
          ShiftShiftId: shiftInfo[i].ShiftId,
          ShiftStatus: "Werked"
        }
      });      

      if (findPastShifts == undefined) {
        console.log('found a null shift');
      } else if (shiftInfo[i].NumberOfWerkers - findPastShifts.length == 0) {
        console.log('this is a past shift');
        SchedPastJob[x] = shiftInfo[i];
        x = x + 1;
      } else if (shiftInfo[i].NumberOfWerkers - findPastShifts.length > 0) {
        console.log('this shift is still open');
      }
      findPastShifts = undefined;
    };

    console.log(SchedPastJob);
    console.log(SchedPastJob);

    res.json({SchedPastJob});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});




module.exports = router;