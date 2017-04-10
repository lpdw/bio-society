var request = require('request');

function doTransaction(data) {
	let options = {
		uri: `https://e-corp.herokuapp.com/transactions`,
		json: true,
		body: data,
		headers: {'Accept': 'application/json, text/html', 'Authorization': 'lpdw-2016', 'Content-Type': 'application/json'}
	};

	let doTransactionPromise = new Promise((resolve, reject) => {
		request.post(options, function (error, response, body) {
			if (error || response.statusCode != 200) {
				return reject(error);
			}
			return resolve(body.transaction_id);
		});
	});

	return doTransactionPromise;
}

function confirmTransaction(id_transaction, data) {
	let options = {
		uri: `https://e-corp.herokuapp.com/transactions/${id_transaction}`,
		json: true,
		body: data,
		headers: {'Accept': 'application/json, text/html', 'Authorization': 'lpdw-2016', 'Content-Type': 'application/json'}
	};

	let comfirmTransactionPromise = new Promise((resolve, reject) => {
		request.put(options, function (error, response, body) {
			if (error || response.statusCode != 200) {
				return reject(error);
			}
			return resolve(body);
		});
	});

	return comfirmTransactionPromise;
}

module.exports = {doTransaction, confirmTransaction};
