var express = require("express");
var router = express.Router();
var models = require("../models");
var authService = require("../services/auth");
const { BOOLEAN } = require("sequelize");
const { sequelize } = require("../models");
const user = require("../models/user");


// @route   POST
// @descr   Create new crew (name)
// @access  PRIVATE (TODO)
router.post("/CrewName", async (req, res) => {
    try {
        let newCrewName = await models.crewname.findOrCreate({
            where: {
              CrewName: req.body.CrewName,
              UserUserId: req.body.Users_UserId_scheduler //scheduler
            }
          });
        res.json(newCrewName);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });


//  @route  GET
//  @descr  Get a list of all crews under a specific scheduler
//  @accces PRIVATE (TODO)  
  router.get("/CrewInfo", async (req, res) => {
    try {
        let crewInfo = await models.user.findAll({
          where: {
            UserId: req.body.UsersUserId
          },
          include: models.crewname
        });
    
        res.json(crewInfo); // schedulerInfo crewInfo
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });


// @route   POST
// @descr   Add an associate to a crew
// @access  PRIVATE (TODO)
router.post("/AddCrewMember", async (req, res) => {
    try {
        let newCrewMember = await models.crewmembers.findOrCreate({
            where: {
              UserUserId: req.body.UserUserId, // werker
              CrewNameCrewId: req.body.CrewName_CrewId
            }
          });
        res.json(newCrewMember);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });


// @route   GET
// @descr   Get a list of crewmembers on a crew
// @access  PRIVATE (TODO)
router.get("/ListOfCrewMembers/:id", async (req, res) => {
  try {
    
    let listOfCrewMembers = await models.crewmembers.findAll({
      where: {
        CrewNameCrewId: req.params.id,
      },
      include: models.user
    });
    
    res.json(listOfCrewMembers)

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


router.get("/ListOfCrewMembers_old/:id", async (req, res) => {
    try {
        const listOfCrewMembers = await models.crewmembers.findAll(
        {where: {
            CrewName_CrewId: req.params.id,
        },
        attributes: {
            exclude: ['CrewMemberId', 'createdAt', 'updatedAt', 'CrewName_CrewId']
        }
        });

        var finalResult = {};
        var finalResultArray = [];
        
        for (let i = 0; i < listOfCrewMembers.length; i++) {
          finalResult = await models.user.findAll({
            where: {
              UserId: listOfCrewMembers[i].Users_UserID_werker
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


    // res.json(listOfCrewMembers);

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });





  module.exports = router;