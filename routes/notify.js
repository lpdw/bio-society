'use strict'
const express = require('express');
const router = express.Router();
const OrderService = require('../services/orders');
var Transaction = require('../lib/transaction');

router.post('/colis', function(req, res, next) {

	if (!req.is('json'))
		return res.status(406).send({err: 'Not valid type for asked resource'});

	let valid = true;
	let error = "";

	if (!req.body.tracking) {
		valid = false;
		error = 'Can\'t find tracking data. ';
	}

	if (!req.body.delivered) {
		valid = false;
		error += 'Can\'t find \'delivered\' data.';
	}

	if (!valid)
		return res.status(400).send({err: error});

		OrderService.findByQuery({id_suivi : req.body.tracking})
			.then(order => {
				//console.log(order.total);
				order.total;
			}).catch(function(error){

			})
		;

	if (req.body.delivered !== 'true' && req.body.delivered !== true && req.body.delivered != 'false' && req.body.delivered != false)
		return res.status(400).send({err: 'Value of \'delivered\' data is not valid.'});

	let delivered = (req.body.delivered === 'true' || req.body.delivered === true);

	if (delivered) {
		let transaction = Transaction.doTransaction({transaction_id:67});
		transaction.then(function(transaction_id) {
			let confirmTransaction = Transaction.confirmTransaction(transaction_id, {status: 2});
			confirmTransaction.then(function(val) {
				return res.status(200).send({msg: 'The payment request for the producer was made successfully.'});
			}).catch(function(error) {
				return res.status(500).send({err: 'An error occurred, the transaction with the bank did not proceed correctly.', bankErr: error});
			});
		}).catch(function(error) {
			return res.status(500).send({err: 'An error occurred, the transaction with the bank did not proceed correctly.', bankErr: error});
		});
	} else {
		let transaction = Transaction.doTransaction({transaction_id:67});
		transaction.then(function(transaction_id) {
			let confirmTransaction = Transaction.confirmTransaction(transaction_id, {status: 2});
			confirmTransaction.then(function(val) {
				return res.status(200).send({msg: 'The refund request for the buyer was successfully completed.'});
			}).catch(function(error) {
				return res.status(500).send({err: 'An error occurred, the transaction with the bank did not proceed correctly.', bankErr: error});
			});
		}).catch(function(error) {
			return res.status(500).send({err: 'An error occurred, the transaction with the bank did not proceed correctly.', bankErr: error});
		});
	}

});

router.put('/test', function(req, res, next) {
	if (!req.is('json')) {
		return res.status(406).send({err: 'Not valid type for asked resource'});
	}

	console.log(req.body);

	return res.status(200).send({msg: "Success"});
});

router.post('/test', function(req, res, next) {
	if (!req.is('json')) {
		return res.status(406).send({err: 'Not valid type for asked resource'});
	}

	console.log(req.body);

	return res.status(200).send({status:1, transaction_id:67});
});

module.exports = router;
