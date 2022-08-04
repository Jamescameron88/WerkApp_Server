var express = require("express");
var router = express.Router();
// const { check, validationResult } = require('express-validator');
var models = require("../models");
var authService = require("../services/auth");
// const { BOOLEAN } = require("sequelize");
const { Sequelize, Op } = require("sequelize");
const { sequelize } = require("../models");
const shifts = require("../models/shifts");
const usershifts = require("../models/usershifts");


//  This function is called when a Notifiable Record needs to be created
async function apiCreateNotificationRecord(reqFx, resFx) {

    console.log("Notifier Array : ", reqFx.newNotificationRecord.UserUserId_notifier);

  
    try {

    //  *************** CREATE USER-ACTION-TAKEN RECORD *******************
        let createUserActionTaken = await models.useractiontaken.create({
            UserActionTypeId: reqFx.newNotificationRecord.UserActionTypeId,
            UserUserId: reqFx.newNotificationRecord.UserUserId_actor,
            MultiKey: reqFx.newNotificationRecord.MultiKey
        });
        let result = await createUserActionTaken;
    //  **************************** FINISH *******************************


    //  **************** CREATE USER-NOTIFICATION RECORD(S) *****************
        console.log("I need this to not be zero : " + reqFx.newNotificationRecord.UserUserId_notifier.length);

        for (let i = 0; i < reqFx.newNotificationRecord.UserUserId_notifier.length; i ++) {

          console.log("made it into the notification PIECE");

          //  ************* IF MESSAGE, THEN CREATE MESSAGE RECORD *******************
          if (reqFx.newNotificationRecord.UserActionTypeId == 14) {
            console.log("made it to the message posting script");
            
            let createUserNotification = await models.usernotificationtable.create({
              UserActionTakenId: createUserActionTaken.id,
              // UserUserId: reqFx.newNotificationRecord.UserUserId_notifier[i],
              ShiftShiftId: reqFx.newNotificationRecord.UserUserId_notifier[i],
              IsRead: 0
            });
            
            let result2 = await createUserNotification;

            let createMessageRecord = await models.messagecontent.create({
                Message: reqFx.newNotificationRecord.UserMessage,
                UserNotificationTableId: createUserNotification.id
            });
            //  ******************* FINISH CREATE RECORD ******************************
          } else {

            //  ******************* CREATE RECORD WITHOUT MESSAGE *********************
            console.log("NOT posting a message notification");
            let createUserNotification = await models.usernotificationtable.create({
              UserActionTakenId: createUserActionTaken.id,
              UserUserId: reqFx.newNotificationRecord.UserUserId_notifier[i],
              IsRead: 0
            });
            let result3 = await createUserNotification;
          }
        }

    } catch (err) {
      console.error(err.message);
    }
};


// @route   GET
// @descr   Retrieve list of Notifications
// @access  PRIVATE (TODO)
router.get("/ListOfNotifications/:id", async (req, res) => {  
  try {  
    let listOfNotifications2 = await models.usernotificationtable.findAll({
      where: {
        UserUserId: req.params.id
      },
      include: [
        { model: models.useractiontaken,
          attributes: [
            'UserActionTypeId',
            'UserUserId',
            'MultiKey'
          ],
            include: [
              { model: models.useractiontype,
              attributes: [
                  'Description',
                  'URLBase'
              ],
          }],
        },
      ],
      // raw: true,
    });

    var listOfNotifications = [];
    for (let i = 0; i < listOfNotifications2.length; i++) {

      let userInfo = await models.user.findOne({
        where: {
          UserId: listOfNotifications2[i].UserActionTaken.UserUserId
        }
      });

      // Bring all the Notifications information together into single object
      listOfNotifications[i] = {
        id: listOfNotifications2[i].id,
        Description: listOfNotifications2[i].Description,
        IsRead: listOfNotifications2[i].IsRead,
        createdAt: Number(listOfNotifications2[i].createdAt, 10),
        updatedAt: listOfNotifications2[i].updatedAt,
        UserActionTakend: listOfNotifications2[i].UserActionTakenId,
        UserUserId: listOfNotifications2[i].UserUserId,
        ShiftShiftId: listOfNotifications2[i].ShiftShiftId,
        UserActionTakenUserActionTyped: listOfNotifications2[i].UserActionTaken.UserActionTypeId,
        UserActionTakenUserUserId: listOfNotifications2[i].UserActionTaken.UserUserId,
        UserActionTakenMultiKey: listOfNotifications2[i].UserActionTaken.MultiKey,
        UserActionTakenUserActionTypeid: listOfNotifications2[i].UserActionTaken.UserActionType.id,
        UserActionTakenUserActionTypeDescription: listOfNotifications2[i].UserActionTaken.UserActionType.Description,
        UserActionTakenUserActionTypeURLBase: listOfNotifications2[i].UserActionTaken.UserActionType.URLBase,
        UserActionTakenUserName: userInfo.FirstName,
        UserActionTakenUserProfilePicURL: userInfo.ProfilePicURL,
        UserActionTakenAppLink: listOfNotifications2[i].UserActionTaken.UserActionType.URLBase + "/" + listOfNotifications2[i].UserActionTaken.MultiKey
      };
    };
    res.json({ listOfNotifications });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


router.post("/SendMessage", async (req, res) => {
  try {

    createUserActionTaken = await models.useractiontaken.findOrCreate({
      where: {
        UserActionTypeId: req.body.newNotificationRecord.UserActionTypeId,
        UserUserId: req.body.newNotificationRecord.UserUserId_actor
      },
    });

    createUserNotification = await models.usernotificationtable.findOrCreate({
      where: {
        UserActionTakenId: createUserActionTaken[0].id,
        UserUserId: req.body.newNotificationRecord.UserUserId_notifier
      },
      defaults: {
        IsRead: 0
      }
    });

    messageContentsObj = await models.messagecontent.findOrCreate({

      where: {
        Message: req.body.newNotificationRecord.UserMessage,
        // UserNotificationTableId: createUserNotification[0].id
      }

    });

    res.json({ "message":"sent" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

});



router.get("/RetrieveMessages/:id", async (req, res) => {

  try {
    
    messagesISent = await models.useractiontaken.findAll({
      where: {
        UserUserId: req.params.id,
        UserActionTypeId: 9
      }
      

    })

    console.log(messagesISent);

    res.json({ "message":"received" });


  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }  



});


//  ******************************************************************************
//  These routes are used to setup the UserActionGroup and UserActionType tables


// @route   POST
// @descr   Create New UserActionGroup
// @access  PRIVATE (TODO)
router.post("/CreateNewUserActionGroup", async (req, res) => {
    // var createAShift = [];
    try { 
        // console.log(req.body.newUserActionGroup);

          createNewUserActionGroup = await models.useractiongroup.findOrCreate({
            where: {
              Description: req.body.newUserActionGroup.Description
            },
          })
        res.json({ createNewUserActionGroup });
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    });


// @route   POST
// @descr   Create New UserActionType
// @access  PRIVATE (TODO)
router.post("/CreateNewUserActionType", async (req, res) => {
    // var createAShift = [];
    try { 
        // console.log(req.body.newUserActionGroup);

          createNewUserActionType = await models.useractiontype.findOrCreate({
            where: {
                UserActionGroupId: req.body.newUserActionType.UserActionGroupId,
                Description: req.body.newUserActionType.Description
            },
          })
        res.json({ createNewUserActionType });
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
    });


module.exports = router
module.exports.apiCreateNotificationRecord = apiCreateNotificationRecord