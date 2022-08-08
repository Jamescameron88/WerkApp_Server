var express = require("express");
var router = express.Router();
const { check, validationResult } = require('express-validator');
var models = require("../models");
var authService = require("../services/auth");
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

    let publishJob = await models.availableshifts.findOrCreate({
      where: {
        UserUserId: req.body.MyCrew.Crew[i],
        ShiftShiftId: req.body.MyCrew.JobJobID.id
      },
    })

    let result3 = await publishJob;
  }

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

  res.json({"schedulersAssociates":3});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
  

//  @route  PUT
//  @descr  Add/Remove a shift slot
//  @access PRIVATE (TODO)
router.put("/AddRemoveShiftSlot/:shiftId/:AddRemove", async (req, res) => {
  try {
   
    //  find the current number of slots
    let addRemoveSlot1 = await models.shifts.findOne({
      where: {
        ShiftId: req.params.shiftId
      }
    });
    
    //  increment/decrement by one
    let newShiftSlots1 = 0
    if (req.params.AddRemove == "Add") {
      let newShiftSlots = addRemoveSlot1.NumberOfWerkers + 1;
      newShiftSlots1 = newShiftSlots
    } else if (req.params.AddRemove == "Remove") {
      let newShiftSlots = addRemoveSlot1.NumberOfWerkers - 1;
      newShiftSlots1 = newShiftSlots
    }

    //  update the shift
    const addRemoveSlot = await models.shifts.update(
      { NumberOfWerkers: newShiftSlots1 },
      { where: { ShiftId: req.params.shiftId }
    });

    //  requery the data to bring back the updated NumberOfWerkers
    let updatedShiftDetails = await models.shifts.findOne({
      where: { ShiftId: req.params.shiftId}
    });

    res.json({ updatedShiftDetails });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


//  @route  GET
//  @descr  Get a list of the invited crew
//  @access PRIVATE (TODO)
router.get("/InvitedWerkers/:jobId", async (req, res) => {
  try {
    let invitedWerkerList1 = await models.availableshifts.findAll({
      where: { 
        ShiftShiftId: req.params.jobId
      }, include: [
        { model: models.user }
      ]
    });
    
    let x = 0;
    let invitedWerkerList = [];
    for (let i = 0; i < invitedWerkerList1.length; i++) {
      invitedWerkerList[x] = {
        UserId: invitedWerkerList1[x].User.UserId,
        FirstName: invitedWerkerList1[x].User.FirstName,
        LastName: invitedWerkerList1[x].User.LastName,
        ProfilePicURL: invitedWerkerList1[x].User.ProfilePicURL
      };
      x = x + 1;
    }  

    res.json({ invitedWerkerList });
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
      // plain: true,
    });

    // console.log(availableShifts[0].dataValues.JJobId);

    // check if the werker has already taken a job
    let x = 0;
    let newAvailableShifts = [];
    for (let i = 0; i < availableShifts.length; i++) {
      // console.log(availableShifts[i].JJobId);

      let findMeInAShift = await models.usershifts.findOne({
        where: { 
          UserUserId: req.params.id,
          ShiftShiftId: availableShifts[i].dataValues.JJobId
        }
      });      

      // console.log(availableShifts[i].dataValues.JJobId);

      if (findMeInAShift == undefined) {
        console.log('null, werker has not taken shift: ' + availableShifts[i].JJobId);
        newAvailableShifts[x] = availableShifts[i];
        x = x + 1;
        // console.log(x);
      } else {
        // console.log('werker has taken shift: ' + availableShifts[i].JJobId);
      }
      findMeInAShift = undefined;
    };

    // check if there are any spots left on a shift
    let y = 0;
    let availableShifts2 = [];
    for (let i = 0; i < newAvailableShifts.length; i++) {
      let countShiftWerkers = await models.usershifts.findAll({
        where: {
          ShiftShiftId: newAvailableShifts[i].dataValues.JJobId
        }
      });

      if (newAvailableShifts[i].Shift.NumberOfWerkers - countShiftWerkers.length > 0) {
        availableShifts2[y] = {
          JJobId: newAvailableShifts[i].dataValues.JJobId,
          SchedulerId: newAvailableShifts[i].Shift.dataValues.SchedulerId,
          Company: newAvailableShifts[i].Shift.Company,
          NumberOfWerkers: newAvailableShifts[i].Shift.NumberOfWerkers,
          Date: newAvailableShifts[i].Shift.dataValues.Date,
          Location: newAvailableShifts[i].Shift.Location,
          Pay: newAvailableShifts[i].Shift.Pay,
          dentifier: newAvailableShifts[i].Shift.ShiftIdentifier,
          UserId: newAvailableShifts[i].Shift.dataValues.SchedulerId,
          JJobId2: newAvailableShifts[i].Shift.dataValues.SchedulerId,
          SchedulerProfilePicURL: newAvailableShifts[i].Shift.User.ProfilePicURL,
          FirstName: newAvailableShifts[i].Shift.User.FirstName,
          LastName: newAvailableShifts[i].Shift.User.LastName,
          ProfilePicURL: newAvailableShifts[i].Shift.User.ProfilePicURL
        };
        y = y + 1;
      };
    };
    
    res.json({ availableShifts2 });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET
// @descr   Retrieve shift details for a Werker
// @access  PRIVATE (TODO)
router.get("/ShiftDetails/:shiftid/:userid", async (req, res) => {
  try {  
    let werkShift2 = await models.shifts.findOne({
      where: {
        ShiftId: parseInt(req.params.shiftid)
      },
      include: [
        { model: models.user,
          attributes: [
            'FirstName',
            'LastName'
          ],
        },
      ],
    });

    let werkShift3 = await models.usershifts.findOne({
      where: {
        ShiftShiftId: parseInt(req.params.shiftid),
        UserUserId: parseInt(req.params.userid)
      },
      attributes: [
        'IsPaid',
        'ShiftStatus'
      ]
    });

    console.log(parseInt(req.params.shiftid), parseInt(req.params.userid));

    // Bring all the shift information together into single object
    let werkShift = {
      ShiftId: werkShift2.ShiftId,
      ShiftIdentifier: werkShift2.ShiftIdentifier,
      POCName: werkShift2.POCName,
      POCPhone: werkShift2.POCPhone,
      Pay: werkShift2.Pay,
      DateDay: werkShift2.DateDay,
      StartDateTime: werkShift2.StartDateTime,
      FinishDateTime: werkShift2.FinishDateTime,
      ShiftNotes: werkShift2.ShiftNotes,
      Company: werkShift2.Company,
      Location: werkShift2.Location,
      SchedulerApproval: werkShift2.SchedulerApproval,
      NumberOfWerkers: werkShift2.NumberOfWerkers,
      ShiftCancelled: werkShift2.ShiftCancelled,
      createdAt: werkShift2.createdAt,
      updatedAt: werkShift2.updatedAt,
      UserUserId: werkShift2.UserUserId,
      SchedFirstName: werkShift2.User.FirstName,
      SchedLastName: werkShift2.User.LastName,
    };
    if (werkShift3 !== null) {
      werkShift.IsPaid = werkShift3.IsPaid;
      werkShift.ShiftStatus = werkShift3.ShiftStatus
    }

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
    console.log(req.body.werkJob);
    
    
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

    console.log("Shift ID " + req.body.werkJob.ShiftId);

    //  ****************** Setup the notification ******************
    //  1. Setup the notification object
    var notificationObject = {
      "newNotificationRecord": {
        "UserActionTypeId": 4,
        "UserUserId_actor": req.body.werkJob.UserId,
        "UserUserId_notifier": [req.body.werkJob.SchedID],
        "MultiKey": req.body.werkJob.ShiftId
      }
    };
    //  2. Call the notification function
    const result = notificationsRoute.apiCreateNotificationRecord(notificationObject,"blank");
    //  ******************  Notification Done ******************


    // if shift is now fulled staffed, send notification to scheduler
    let shiftWerkersNeeded = await models.shifts.findOne({
      where: {
        ShiftId: req.body.werkJob.ShiftId
      }
    });
    let countShiftWerkers = await models.usershifts.findAll({
      where: {
        ShiftShiftId: req.body.werkJob.ShiftId,
        ShiftStatus: "Scheduled"
      }
    });

    if (shiftWerkersNeeded.NumberOfWerkers - countShiftWerkers.length == 0) {
      //  ****************** Setup the notification ******************
      //  1. Setup the notification object
      var notificationObject = {
        "newNotificationRecord": {
          "UserActionTypeId": 7,
          "UserUserId_actor": req.body.werkJob.UserId,
          "UserUserId_notifier": [req.body.werkJob.SchedID],
          "MultiKey": req.body.werkJob.ShiftId
        }
      };
      //  2. Call the notification function
      const result = notificationsRoute.apiCreateNotificationRecord(notificationObject,"blank");
      //  ******************  Notification Done ******************
    }

    res.json({ werkShift });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   DELETE
// @descr   Scheduler removes Werker OR Werker removes himself from shift
// @access  PRIVATE (TODO)
router.delete("/RemoveWerkerFromShift/:werkerId/:shiftId/:WerkerScheduler/:SchedulerId", async (req, res) => {
  try {
    let removeWerker = await models.usershifts.destroy({
      where: {
        UserUserId: req.params.werkerId,
        ShiftShiftId: req.params.shiftId
      }
    });

    if (req.params.WerkerScheduler == "Werker") {
      //  If werker cancels himself, send notification to the scheduler
      //  1. Setup the notification object
      var notificationObject = {
        "newNotificationRecord": {
          "UserActionTypeId": 11,
          "UserUserId_actor": req.params.werkerId,
          "UserUserId_notifier": [req.params.SchedulerId],
          "MultiKey": req.params.shiftId
        }
      };
      //  2. Call the notification function
      const result = notificationsRoute.apiCreateNotificationRecord(notificationObject,"blank");
      //  ******************  Notification Done ******************
    } else { // WerkerScheduler == Scheduler
      //  If scheduler cancels werker, send notification to the werker
      //  1. Setup the notification object
      var notificationObject = {
        "newNotificationRecord": {
          "UserActionTypeId": 10,
          "UserUserId_actor": req.params.SchedulerId,
          "UserUserId_notifier": [req.params.werkerId],
          "MultiKey": req.params.shiftId
        }
      };
      //  2. Call the notification function
      const result = notificationsRoute.apiCreateNotificationRecord(notificationObject,"blank");
      //  ******************  Notification Done ******************
    }

    res.json({ "WerkerScheduler": req.params.WerkerScheduler });

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
        ShiftStatus: 'Scheduled'
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
        [Op.or]: [
          { ShiftStatus: 'Cancelled' },
          { ShiftStatus: 'Werked' },
          { ShiftStatus: 'Paid' }
        ]
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


    //  If werked, then 5, If cancelled then 10 & 11.

    if (req.body.updateWerkerShiftStatus.UpdateStatus == "Werked") {
      //  ****************** Setup the notification ******************
      //  1. Setup the notification object
          var notificationObject = {
            "newNotificationRecord": {
              "UserActionTypeId": 5,
              "UserUserId_actor": req.body.updateWerkerShiftStatus.UserId,
              "UserUserId_notifier": [req.body.updateWerkerShiftStatus.SchedID],
              "MultiKey": req.body.updateWerkerShiftStatus.ShiftId
            }
          };
      //  2. Call the notification function
      const result = notificationsRoute.apiCreateNotificationRecord(notificationObject,"blank");
      //  ******************  Notification Done ******************

    } else {

      //  ****************** Setup the notification ******************
      //  1. Setup the notification object - SCHEDULER
      var notificationObject2 = {
        "newNotificationRecord": {
          "UserActionTypeId": 11,
          "UserUserId_actor": req.body.updateWerkerShiftStatus.UserId,
          "UserUserId_notifier": [req.body.updateWerkerShiftStatus.SchedID],
          "MultiKey": req.body.updateWerkerShiftStatus.ShiftId
        }
      };
  //  2. Call the notification function
  const result2 = notificationsRoute.apiCreateNotificationRecord(notificationObject2,"blank");
  //  ******************  Notification Done ******************

      //  ****************** Setup the notification ******************
      //  1. Setup the notification object - WERKER
      var notificationObject3 = {
        "newNotificationRecord": {
          "UserActionTypeId": 10,
          "UserUserId_actor": req.body.updateWerkerShiftStatus.UserId,
          "UserUserId_notifier": [req.body.updateWerkerShiftStatus.UserId],
          "MultiKey": req.body.updateWerkerShiftStatus.ShiftId
        }
      };
  //  2. Call the notification function
  const result3 = notificationsRoute.apiCreateNotificationRecord(notificationObject3,"blank");
  //  ******************  Notification Done *****************
    }

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
      { IsPaid: req.body.updateWerkerShiftStatus.IsPaid,
        ShiftStatus: "Paid"},
      { where: {
        UserUserId: req.body.updateWerkerShiftStatus.UserId,
        ShiftShiftId: req.body.updateWerkerShiftStatus.ShiftId
      }
    });

  //  1. Setup the notification object
      var notificationObject = {
        "newNotificationRecord": {
          "UserActionTypeId": 6,
          "UserUserId_actor": req.body.updateWerkerShiftStatus.UserId,
          "UserUserId_notifier": [req.body.updateWerkerShiftStatus.SchedID],
          "MultiKey": req.body.updateWerkerShiftStatus.ShiftId
        }
      };
  //  2. Call the notification function
  const result = notificationsRoute.apiCreateNotificationRecord(notificationObject,"blank");
  //  ******************  Notification Done ******************


    res.json('Status updated');
    // res.json({ werkerIsPaid });
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
// @descr   Retrieve shift details for a scheduler
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
    
    // logic below: but for now this sets up an assumption that all werkers have "werked" the job
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
        //  this is ok; confirms each werker has "werked" the job 
      } else {
        // breaks the assumption: werker has not "werked" the job so it's not in the Past
        werkerShiftStatus = "Not Past" 
      }
    };
    Werkers = werkersInfoArray;

    //  get the number of shifts still open
    let OpenShifts = { 'unfilledshifts' : (WerkShift.NumberOfWerkers - Werkers.length) };


    //  ============================== LOGIC to Setup Shift Status ==================================
    //  LOGIC
    //  1st: If everybody werked the job, then it's in the Past (established above).
    //  2nd: If scheduler cancelled the job, then it's Cancelled.
    //  3rd: If there's 1+ open slots, the shift is Open.
    //  4th: If none of the above, then shift is Scheduled.
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
          [Op.or]: [
            { ShiftStatus: "Scheduled" },
            { ShiftStatus: "Werked" }
          ]
          // ShiftStatus: "Scheduled" // operator OR
        }
      });      

      if (findOpenShifts == undefined) {
        console.log('found a null shift');
      } else if (shiftInfo[i].NumberOfWerkers - findOpenShifts.length == 0) {
        
          // check for at least one werker shift marked as "scheduled"
          let scheduledShiftSwitch = "no"
          for (let y = 0; y < findOpenShifts.length; y++) {
            if (findOpenShifts[y].ShiftStatus == 'Scheduled') {
              console.log('this is a scheduled shift');
              SchedScheduledJob[x] = shiftInfo[i];
              x = x + 1;
            }
          }
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
          [Op.or]: [
            { ShiftStatus: "Werked" },
            { ShiftStatus: "Paid" }
          ]
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


// @route   PUT
// @descr   Update Scheduler Shift to Cancelled
// @access  PRIVATE (TODO)
router.put("/SchedCancel/:id", async (req, res) => {
  try {  
    
    const schedCancelShift = await models.shifts.update(
      { ShiftCancelled: 1 },
      { where: {
        ShiftId: req.params.id
      }
    });
    const schedIDQuery = await models.shifts.findOne({
      where: {
        ShiftId: req.params.id
      }
    });

    // console.log("scheduler = " + JSON.stringify(schedIDQuery));

    const werkersToNofify = await models.usershifts.findAll({
      where: {
        ShiftShiftId: req.params.id
      }
    });
    let werkersToNofify2 = werkersToNofify.map(({ UserUserId }) => UserUserId);

    console.log("werkers to notify : " + JSON.stringify(werkersToNofify));

  //  SEND NOTIFICATION TO SCHEDULER AND WERKER (SEPARATELY)
  //  SCHEDULER
      //  1. Setup the notification object
          var notificationObject = {
            "newNotificationRecord": {
              "UserActionTypeId": 9,
              "UserUserId_actor": schedIDQuery.UserUserId,
              "UserUserId_notifier": [schedIDQuery.UserUserId],
              "MultiKey": req.params.id
            }
          };
  //  2. Call the notification function
  const result = notificationsRoute.apiCreateNotificationRecord(notificationObject,"blank");

  //  WERKER
  //  1. Setup the notification object
      var notificationObject2 = {
        "newNotificationRecord": {
          "UserActionTypeId": 8,
          "UserUserId_actor": schedIDQuery.UserUserId,
          "UserUserId_notifier": [werkersToNofify2],
          "MultiKey": req.params.id
        }
      };
  //  2. Call the notification function
  const result2 = notificationsRoute.apiCreateNotificationRecord(notificationObject2,"blank");
  //  ******************  Notification Done ******************


    res.json('Status updated');
    // res.json({ werkerIsPaid });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT
// @descr   Edit user profile
// @access  PUBLIC (for testing)
router.put("/EditSchedShift/", async (req, res) => {
  try {
    const { ShiftId, ShiftIdentifier, Pay, DateDay, StartDateTime, FinishDateTime, ShiftNotes, Company, Location, NumberOfWerkers } = req.body.editSchedJob;
    
    const shiftRecord = await models.shifts.update(
      { 
        ShiftIdentifier,
        Pay,
        DateDay,
        StartDateTime,
        FinishDateTime,
        ShiftNotes,
        Company,
        Location,
        NumberOfWerkers
      },
      { where: {
          ShiftId: ShiftId
        }
    });

    const EditSchedShift = await models.shifts.findOne({
      where: {
        ShiftId: ShiftId
      }
    });

    res.json({ EditSchedShift });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;