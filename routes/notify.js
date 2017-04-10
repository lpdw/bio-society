'use strict'
const express = require('express');
const router = express.Router();
const APIError = require('../lib/apiError');
const passport = require('passport');

router.post('/colis', function(req, res, next) {
	if (!req.is('json')) {
		return res.status(406).send({err: 'Not valid type for asked resource'});
	}

	let valid = true;
	let error = "";
	
	if (!req.body.tracking) {
		valid = false;
		error = 'Can\'t find tracking data. ';
	}

	if (!req.body.status) {
		valid = false;
		error += 'Can\'t find status data.';
	}

	if (!valid) {
		return res.status(400).send({err: error});
	}

	if (req.body.status != 'true' && req.body.status != 'false') {
		return res.status(400).send({err: 'Value of status data is not valid.'});
	}

	let status = (req.body.status === 'true');

	if (status) {
		return res.status(200).send({msg: 'The payment request for the producer was made successfully.'});
	} else {
		return res.status(200).send({msg: 'The refund request for the buyer was successfully completed.'});
	}

});

module.exports = router;
