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

	if (req.body.tracking === undefined) {
		valid = false;
		error = 'Can\'t find tracking data. ';
	}

	if (req.body.delivered === undefined) {
		valid = false;
		error += 'Can\'t find \'delivered\' data.';
	}

	if (!valid)
		return res.status(400).send({err: error});

	if (req.body.delivered !== 'true' && req.body.delivered !== true && req.body.delivered != 'false' && req.body.delivered != false)
		return res.status(400).send({err: 'Value of \'delivered\' data is not valid.'});

	OrderService.findByQuery({id_suivi:req.body.tracking}).then(orders => {
		if (orders.length > 1)
			console.log("Some orders have the same tracking number !");
		else if (orders.length == 0)
			console.log("No order with tracking nomber '" + req.body.tracking + "' found !");
		else {
			let amount = orders[0].total;
			let delivered = (req.body.delivered === 'true' || req.body.delivered === true);

			if (delivered) {
				let jsonData = {"type":2,"payer":"010203040506","status":1,"amount":amount,"message":"Merci Jacquie et Michel !","beneficiary":"342434214242","token":"djeixhfqxdsqdqcgf"};
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
				let jsonData = {"type":3,"payer":"010203040506","status":1,"amount":amount,"message":"Merci Jacquie et Michel !","beneficiary":orders[0].carte_bleue,"token":"hdzfdfchrofgbhcsxq"};
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
		}
	}).catch(function(error){
		console.log("No id_suivi found ! ", error);
	});

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
	//return res.status(403).send({err: "No money !"});
});

module.exports = router;
