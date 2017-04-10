'use strict';
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Orders', {
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
	});
};
