var request = require('request');

function doTransaction(data) {
	let options = {
		url: `http://localhost:3000/notify/test`, // https://e-corp.herokuapp.com/transactions/
		json: data,
		headers: {'Accept': 'application/json', 'authorization': 'lpdw-2016'}
	};

	let doTransactionPromise = new Promise((resolve, reject) => {
		request.post(options, function (error, response, body) {
			if (error || response.statusCode != 200) {
				return reject(error);
			}
			console.log(body);
			return resolve(body.transaction_id);
		});
	});

	return doTransactionPromise;
}

function confirmTransaction(id_transaction, data) {
	let options = {
		url: `http://localhost:3000/notify/test`, // https://e-corp.herokuapp.com/transactions/${id_transaction}
		json: data,
		headers: {'Accept': 'application/json', 'authorization': 'lpdw-2016'}
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
