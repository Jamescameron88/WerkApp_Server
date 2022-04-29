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

    try {

        let createUserActionTaken = await models.useractiontaken.findOrCreate({
          where: {
            UserActionTypeId: reqFx.newNotificationRecord.UserActionTypeId,
            UserUserId: reqFx.newNotificationRecord.UserUserId_actor
          },
        });

        let result = await createUserActionTaken;

        let createUserNotification = await models.usernotificationtable.findOrCreate({
          where: {
            UserActionTakenId: createUserActionTaken[0].id,
            UserUserId: reqFx.newNotificationRecord.UserUserId_notifier
          },
          defaults: {
            IsRead: 0
          }
        });

        let result2 = await createUserNotification;
      
      console.log(result);
      console.log(createUserNotification);

    } catch (err) {
      console.error(err.message);
    }
};



// @route   GET
// @descr   Retrieve list of Notifications
// @access  PRIVATE (TODO)
router.get("/ListOfNotifications/:id", async (req, res) => {
    
  // await apiCreateNotificationRecord (req, res);
  
  try {  
    let listOfNotifications2 = await models.usernotificationtable.findAll({
      where: {
        UserUserId: req.params.id
      },
      include: [
        { model: models.useractiontaken,
          attributes: [
            'UserActionTypeId',
            'UserUserId'
          ],
            include: [
              { model: models.useractiontype,
              attributes: [
                  'Description'
              ],
          }],
        },
      ],
      raw: true,
    })

    var str = JSON.stringify(listOfNotifications2);
    str = str.replace(/UserActionTaken./g,'UserActionTaken');
    var listOfNotifications3 = JSON.parse(str);

    var str = JSON.stringify(listOfNotifications3);
    str = str.replace(/UserActionTakenUserActionType./g,'UserActionTakenUserActionType');
    var listOfNotifications = JSON.parse(str);

    for (let i = 0; i < listOfNotifications.length; i++) {

      let userInfo = await models.user.findOne({
        where: {
          UserId: listOfNotifications[i].UserActionTakenUserUserId
        }
      })

      listOfNotifications[i].UserActionTakenUserName = userInfo.FirstName;
      listOfNotifications[i].UserActionTakenUserProfilePicURL = userInfo.ProfilePicURL;

    }

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
        UserNotificationTableId: createUserNotification[0].id
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