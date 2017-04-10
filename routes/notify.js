'use strict'
const express = require('express');
const router = express.Router();
var doTransaction = require('../lib/transaction');

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

	if (req.body.delivered !== 'true' && req.body.delivered !== true && req.body.delivered != 'false' && req.body.delivered != false)
		return res.status(400).send({err: 'Value of \'delivered\' data is not valid.'});

	let delivered = (req.body.delivered === 'true' || req.body.delivered === true);

	if (delivered) {
		let transaction = doTransaction('http://localhost:3000/notify/test', {test: "test"});
		transaction.then(function(val) {
			let confirmTransaction = doTransaction('http://localhost:3000/notify/test', {transactionId:val.transactionId, status:true});
			confirmTransaction.then(function(val) {
				return res.status(200).send({msg: 'The payment request for the producer was made successfully.'});
			}).catch(function(error) {
				return res.status(500).send({err: 'An error occurred, the transaction with the bank did not proceed correctly.', bankErr: error});
			});
		}).catch(function(error) {
			return res.status(500).send({err: 'An error occurred, the transaction with the bank did not proceed correctly.', bankErr: error});
		});
		return res.status(500).send({err: 'An error has occurred. Please contact an administrator of BioSociety.'});
	} else {
		let transaction = doTransaction('http://localhost:3000/notify/test', {test: "test"});
		transaction.then(function(val) {
			let confirmTransaction = doTransaction('http://localhost:3000/notify/test', {transactionId:val.transactionId, status:true});
			confirmTransaction.then(function(val) {
				return res.status(200).send({msg: 'The refund request for the buyer was successfully completed.'});
			}).catch(function(error) {
				return res.status(500).send({err: 'An error occurred, the transaction with the bank did not proceed correctly.', bankErr: error});
			});
		}).catch(function(error) {
			return res.status(500).send({err: 'An error occurred, the transaction with the bank did not proceed correctly.', bankErr: error});
		});
		return res.status(500).send({err: 'An error has occurred. Please contact an administrator of BioSociety.'});
	}

});

router.post('/test', function(req, res, next) {
	if (!req.is('json')) {
		return res.status(406).send({err: 'Not valid type for asked resource'});
	}

	return res.status(200).send({msg: 'Ok ça passe !'});
});

module.exports = router;
