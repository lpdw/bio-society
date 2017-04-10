'use strict';
module.exports = (sequelize, DataTypes) => {
    var Orders = sequelize.define('Orders', {
        data: {
           type: DataTypes.STRING
        },
		date: {
			type: DataTypes.DATE
		},
        total: {
           type: DataTypes.FLOAT
        },
		statut:{
			type: DataTypes.STRING
		}
	},{
		classMethods: {
			associate: function(database) {
				Orders.belongsTo(database.Users);
			}
		}
	});
	
	return Orders;
};
