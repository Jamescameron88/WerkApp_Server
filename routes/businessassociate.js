var express = require("express");
var router = express.Router();
var models = require("../models");
var authService = require("../services/auth");
const { BOOLEAN } = require("sequelize");
const { sequelize } = require("../models");
const user = require("../models/user");


// @route   POST
// @descr   Get list of users associate requests
// @access  PRIVATE
router.post("/Notifications", async (req, res) => {
  try {
    const happyResult =  await models.businessassociate.findAll({
    where: {
      b_Users_UserId: req.body.profile.UserId,
      RequestStatus: "new",
    },
    attributes: {
      exclude: ['BusinessAssociateId', 'b_Users_UserId', 'RequestStatus', 'createdAt', 'updatedAt']
    }
  });
    
  var finalResult = {};
  var finalResultArray = [];
  
  for (let i = 0; i < happyResult.length; i++) {
    finalResult = await models.user.findAll({
      where: {
        UserId: happyResult[i].a_Users_UserId
      },
      attributes: {
        exclude: ['Email', 'Username', 'Password', 'IsScheduler', 'IsDeleted', 'createdAt', 'updatedAt']
      }
    });
    finalResultArray.push({...finalResult});
  }

    var str = JSON.stringify(finalResultArray);
    str = str.replace(/{"0":/g,'');
    str = str.replace(/}}]/g,'}]');
    str = str.replace(/}}/g,'}');
    console.log(str);
    console.log(JSON.parse(str));

    const happyResult2 = JSON.parse(str);

    res.json({ happyResult2 });
  } catch (err) {
  console.error(err.message);
  res.status(500).send('Server Error');
}
});


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
});


// router.post("/AssociateProfile/:id", async (req, res) => {
  
//   try {
//     // Check if association already exists
//     let associates1 = await models.businessassociate.findAll({
//       where: {
//         a_Users_UserId: req.body.Self.UserId
//       }
//     });
//     if (associates1.length === 0 ) {
//       let requestSent = await models.businessassociate.findOrCreate({
//         where: {
//           a_Users_UserId: req.body.Self.UserId,
//           b_Users_UserId: req.body.ListProfile.UserId,
//           RequestStatus: "RequestSent"
//         }
//       });
//       let requestReceived = await models.businessassociate.findOrCreate({
//         where: {
//           b_Users_UserId: req.body.Self.UserId,
//           a_Users_UserId: req.body.ListProfile.UserId,
//           RequestStatus: "RequestReceived"
//         }
//       });
//       console.log('associates 1 is empty')
//     } else {
//       res.json('Request already in process');
//     };
//     res.json(associates1);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });





// ************************ PRACTICE ************************ 
// Send associate request
// router.post("/AssociateProfile2/:id", async (req, res) => {
  
//   try {
//     // Check if association already exists
//     let associates1 = await models.businessassociate.findAll({
//       where: {
//         a_Users_UserId: req.body.UserId
//       }
//     });
//     if (associates1.length === 0 ) {
//       let requestSent = await models.businessassociate.findOrCreate({
//         where: {
//           a_Users_UserId: req.body.a_UserId,
//           b_Users_UserId: req.body.b_UserId,
//           RequestStatus: "RequestSent"
//         }
//       });
//       let requestReceived = await models.businessassociate.findOrCreate({
//         where: {
//           b_Users_UserId: req.body.a_UserId,
//           a_Users_UserId: req.body.b_UserId,
//           RequestStatus: "RequestReceived"
//         }
//       });
//       console.log('associates 1 is empty')
//     } else {
//       res.json('Request already in process');
//     };
//     res.json(associates1);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });






module.exports = router;
