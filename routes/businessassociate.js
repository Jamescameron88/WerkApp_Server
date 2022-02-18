var express = require("express");
var router = express.Router();
var models = require("../models");
var authService = require("../services/auth");
const { BOOLEAN } = require("sequelize");
const { sequelize } = require("../models");
const user = require("../models/user");


// everything inside the try
// let token = req.cookies.jwt;
//     if (token) {
//       const authUser = await authService.verifyPerson(token); 
//       if (authUser) {
        
//         // CODE GOES HERE

//         } else {
//           res.status(401);
//           res.json("Must be logged in");
//         }
//     }


// @route   POST
// @descr   Check what the relationship status is
// @access  PRIVATE (TODO)
router.post("/AssociateRelationshipStatus", async (req, res) => {
  
  let token = req.cookies.jwt;
  console.log('friends', token);
  
  try {
    let associationStatus = await models.businessassociate.findOne({
      where: {
        a_Users_UserId: req.body.self.UserId,
        b_Users_UserId: req.body.listProfile.UserId
      }
    })
    if (!associationStatus) {
      associationStatus = {"RequestStatus":"NotAssociates"}
    }
    res.json({associationStatus});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   POST
// @descr   Send Add Associate requests
// @access  PRIVATE (TODO)
router.post("/AssociateProfile/:id", async (req, res) => {
  try {
    console.log(req.cookies.jwt);
    let associates1 = await models.businessassociate.findAll({
      where: {
        a_Users_UserId: req.body.Self.UserId,
        b_Users_UserId: req.body.ListProfile.UserId
      }
    });
    if (associates1.length === 0 ) {
      let requestSent = await models.businessassociate.findOrCreate({
        where: {
          a_Users_UserId: req.body.Self.UserId,
          b_Users_UserId: req.body.ListProfile.UserId,
          RequestStatus: "RequestSent"
        }
      });
      let requestReceived = await models.businessassociate.findOrCreate({
        where: {
          b_Users_UserId: req.body.Self.UserId,
          a_Users_UserId: req.body.ListProfile.UserId,
          RequestStatus: "RequestReceived"
        }
      });
      res.json(associates1);
    } else {
      res.json('Request already in process');
    };
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   POST
// @descr   Get list of associate requests RECEIVED
// @access  PRIVATE (TODO)
router.post("/Notifications/RequestsReceived", async (req, res) => {
  try {
    console.log("beginning of test");
    console.log(req.body.profile.UserId);
    console.log(req.cookies.jwt);
    console.log("end of test");
    const happyResult =  await models.businessassociate.findAll({
    where: {
      a_Users_UserId: req.body.profile.UserId,
      RequestStatus: "RequestReceived",
    },
    attributes: {
      exclude: ['BusinessAssociateId', 'RequestStatus', 'createdAt', 'updatedAt']
    }
  });
    
  var finalResult = {};
  var finalResultArray = [];
  
  for (let i = 0; i < happyResult.length; i++) {
    finalResult = await models.user.findAll({
      where: {
        UserId: happyResult[i].b_Users_UserId
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


// @route   POST
// @descr   Get list of associate requests SENT
// @access  PRIVATE (TODO)
router.post("/Notifications/RequestsSent", async (req, res) => {
  try {
    const happyResult =  await models.businessassociate.findAll({
    where: {
      a_Users_UserId: req.body.profile.UserId,
      RequestStatus: "RequestSent",
    },
    attributes: {
      exclude: ['BusinessAssociateId', 'RequestStatus', 'createdAt', 'updatedAt']
    }
  });
    
  var finalResult = {};
  var finalResultArray = [];
  
  for (let i = 0; i < happyResult.length; i++) {
    finalResult = await models.user.findAll({
      where: {
        UserId: happyResult[i].b_Users_UserId
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


// @route   PUT
// @descr   Update associate request (accept/decline)
// @access  PRIVATE (TODO)
router.put("/UpdateRequest", async (req, res) => {
  try {
    // find the user who had received the request
    // change their status to RequestStatus (set on FrontEnd)
    const userAccepted = await models.businessassociate.update(
     { RequestStatus: req.body.requestResponse.RequestStatus },
     { where: { 
       a_Users_UserId: req.body.Self.UserId,
       b_Users_UserId: req.body.ListProfile.UserId 
    }  
  });
    // find the user who had sent the request
    // change their status to RequestStatus (set on FrontEnd)
    const userAccepted2 = await models.businessassociate.update(
      { RequestStatus: req.body.requestResponse.RequestStatus },
      { where: { 
        a_Users_UserId: req.body.ListProfile.UserId,
        b_Users_UserId: req.body.Self.UserId
      }
    });
    res.json('Request updated');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET
// @descr   Get list of a user's requests
// @access  PRIVATE (TODO)
router.get("/ListOfAssociates/:id", async (req, res) => {
try {
  const listOfAssociates = await models.businessassociate.findAll(
    {where: {
      a_Users_UserId: req.params.id,
      RequestStatus: "RequestAccepted"
    },
    attributes: {
      exclude: ['BusinessAssociateId', 'RequestStatus', 'createdAt', 'updatedAt']
    }
    });

    var listOfAssociatesObj = {};
    var listOfAssociatesArray = [];

    for (let i = 0; i < listOfAssociates.length; i++) {
      listOfAssociatesObj = await models.user.findAll({
        where: {
          UserId: listOfAssociates[i].b_Users_UserId
        },
        attributes: {
          exclude: ['Email', 'Username', 'Password', 'IsScheduler', 'IsDeleted', 'createdAt', 'updatedAt']
        }
      });
      listOfAssociatesArray.push({...listOfAssociatesObj});
    }


    var str = JSON.stringify(listOfAssociatesArray);
    str = str.replace(/{"0":/g,'');
    str = str.replace(/}}]/g,'}]');
    str = str.replace(/}}/g,'}');

    const listOfAssociates2 = JSON.parse(str);

    res.json({listOfAssociates2});
} catch (err) {
  console.error(err.message);
  res.status(500).send('Server Error');
}
});


module.exports = router;
