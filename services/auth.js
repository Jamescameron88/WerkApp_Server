const jwt = require('jsonwebtoken');
const models = require('../models/index');

var authService = {
  signPerson: function(user) {
    const token = jwt.sign(
      {
        Email: user.Email,
        UserId: user.UserId,
      },
      'secretkey',
      {
        expiresIn: '1h'
      }
    );
    return token;
  },
  verifyPerson: function (token) {  
      
    try {
      let decoded = jwt.verify(token, 'secretkey'); 
      return models.person.findByPk(decoded.UserId); 
    } catch (err) {
      console.log(err);
      return null;
    }
  }
  
};

module.exports = authService;