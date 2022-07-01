var express = require("express");
var router = express.Router();
var models = require("../models");
var authService = require("../services/auth");
const { Sequelize, Op } = require("sequelize");
const { sequelize } = require("../models");
const notificationsRoute = require("../routes/notifications");
const { body } = require("express-validator");


//  Test route for messages 
router.post("/PostShiftMessage", async (req, res) => {

  try {

    //  Determine who needs to receive notifications [the Notifiers]
    //  Get a list of the werkers
    const werkersToNofify = await models.usershifts.findAll({
      where: {
        ShiftShiftId: req.body.newNotificationRecord.ShiftId
      }
    });
    //  Bring their UserIds into an array
    let werkersToNofify2 = werkersToNofify.map(({ UserUserId }) => UserUserId);
    
    //  Add the Scheduler's UserId to the array
    // werkersToNofify2.push(req.body.newNotificationRecord.SchedUserId);


    //  Remove the actor's UserId from the array
    const index = werkersToNofify2.indexOf(req.body.newNotificationRecord.UserUserId_actor);
    if (index > -1) {
      werkersToNofify2.splice(index, 1);
    }

    // console.log("werkers to notify : " + JSON.stringify(werkersToNofify));
    // console.log("werkers to notify2 : " + werkersToNofify2);


    //  ****************** Setup the notification ******************
    //  ****************** SCHEDULER Notification ******************
    
    // first check if the actor is the scheduler, if he is don't send a notification
        if (req.body.newNotificationRecord.UserUserId_actor == req.body.newNotificationRecord.SchedUserId) {
          console.log("don't send a notification to the scheduler because he's the actor");
        } else {
          //  send a notification to the scheduler
          //  1. Setup the notification object

          var notificationObject = {
            "newNotificationRecord": {
              "UserActionTypeId": 13,
              "UserUserId_actor": req.body.newNotificationRecord.UserUserId_actor,
              "UserUserId_notifier": [req.body.newNotificationRecord.SchedUserId],
              // "UserMessage": req.body.newNotificationRecord.UserMessage,
              "MultiKey": req.body.newNotificationRecord.ShiftId
            }
          };
          //  2. Call the notification function
          const result1 = notificationsRoute.apiCreateNotificationRecord(notificationObject,"blank");
          //  ****************** SCHEDULER Notification Done ******************
        }

    //  ****************** Setup the notification ******************
    //  ****************** WERKER Notification ******************

    //  1. Setup the notification object

          var notificationObject = {
            "newNotificationRecord": {
              "UserActionTypeId": 12,
              "UserUserId_actor": req.body.newNotificationRecord.UserUserId_actor,
              "UserUserId_notifier": werkersToNofify2,
              "MultiKey": req.body.newNotificationRecord.ShiftId
            }
          };
          console.log("message from NotificationObject - WERKER");
          console.log(JSON.stringify(notificationObject.newNotificationRecord));
          //  2. Call the notification function
          const result2 = notificationsRoute.apiCreateNotificationRecord(notificationObject,"blank");
          //  ******************  Notification Done ******************


    //  ****************** Setup the notification ******************
    //  **************** CONNECT SHIFT TO MESSAGE ****************** 

    //  1. Setup the notification object

        var notificationObject = {
          "newNotificationRecord": {
            "UserActionTypeId": 14,
            "UserUserId_actor": req.body.newNotificationRecord.UserUserId_actor,
            "UserUserId_notifier": [req.body.newNotificationRecord.ShiftId],
            "UserMessage": req.body.newNotificationRecord.UserMessage,
            // "MultiKey": req.body.newNotificationRecord.ShiftId
          }
        };

        // console.log("message from NotificationObject");
        // console.log(notificationObject.newNotificationRecord.UserMessage);

        //  2. Call the notification function
        const result3 = notificationsRoute.apiCreateNotificationRecord(notificationObject,"blank");
        //  ******************  Notification Done ******************



    // console.log(req.body);

    res.json({ "message":1 });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET
// @descr   Retrieve shift messages
// @access  PRIVATE (TODO)
router.get("/GetShiftMessages/:id", async (req, res) => {
  try {  
    var shiftNotifications2 = await models.usernotificationtable.findAll({
      where: {
        ShiftShiftId: req.params.id
      },
      include: [
        { model: models.useractiontaken,
          attributes: [
            'UserUserId',
          ],
        },
      ],
      // raw: true,
    });

    var shiftMessages = [];
    for (let i = 0; i < shiftNotifications2.length; i++) {

      let shiftMessages2 = await models.messagecontent.findOne({
        where: {
          UserNotificationTableId: shiftNotifications2[i].id
        }
      });

      let messageAuthor2 = await models.user.findOne({
        where: {
          UserId: shiftNotifications2[i].UserActionTaken.UserUserId
        }
      });

      // Bring all the message information together into single object
      shiftMessages[i] = {
        id: shiftNotifications2[i].id,
        IsRead: shiftNotifications2[i].IsRead,
        createdAt: shiftNotifications2[i].createdAt,
        updatedAt: shiftNotifications2[i].updatedAt,
        UserActionTakenId: shiftNotifications2[i].UserActionTakenId,
        ShiftShiftId: shiftNotifications2[i].ShiftShiftId,
        UserActionTakenUserId: shiftNotifications2[i].UserActionTaken.UserUserId,
        MessageBox: shiftMessages2.Message,
        MessageAuthor: messageAuthor2.FirstName + " " + messageAuthor2.LastName
      };

    };

    res.json({ shiftMessages });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});








module.exports = router;