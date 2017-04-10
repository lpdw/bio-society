'use strict';
module.exports = (sequelize, DataTypes) => {
    var Users = sequelize.define('Users', {
        username: {
           type: DataTypes.STRING,
           validate: {notEmpty: {msg: "-> Missing username"}}
        },
        firstname: {
           type: DataTypes.STRING,
           validate: {notEmpty: {msg: "-> Missing firstname"}}
        },
        lastname: {
           type: DataTypes.STRING,
           validate: {notEmpty: {msg: "-> Missing lastname"}}
        },
        password: {
           type: DataTypes.STRING,
           validate: {notEmpty: {msg: "-> Missing password"}}
        },
        address: {
           type: DataTypes.STRING,
           validate: {notEmpty: {msg: "-> Missing address"}}
        },
        postcode: {
           type: DataTypes.INTEGER,
           validate: {notEmpty: {msg: "-> Missing postcode"}}
        },
        phone_number: {
           type: DataTypes.INTEGER,
           validate: {notEmpty: {msg: "-> Missing phone number"}}
        }
   },{
		classMethods: {
			associate: function(database) {
				Users.hasMany(database.Orders)
			}
		}
	});
	
	return Users;
};
