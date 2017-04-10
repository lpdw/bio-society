'use strict'
const db = require('../database');

exports.findByQuery = query => {
    return db.Orders.findAll({
       where: query
    });
};

exports.findOneByQuery = query => {
    return db.Orders.findOne({
       where: query
    });
};

exports.create = (order) => {
	const model = db.Orders.build(order);
	return model.validate()
		.then(err => {
			if (err) {
				return Promise.reject(err);
			}
			return model.save();
		})
	;
};

exports.updateById = (id, dataToUpdate) => {
    return db.Orders.update(dataToUpdate, { where: { id }, returning: true });
};
