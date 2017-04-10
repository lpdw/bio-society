var request = require('request');

function doTransaction(url, data) {
	let options = {
		uri: url,
		json: data,
		headers: {'Accept': 'application/json', 'authorization': 'lpdw-2016'}
	};

	let setTransactionPromise = new Promise((resolve, reject) => {
		request.post(options, function (error, response, body) {
			if (error || response.statusCode != 200) {
				return reject(error);
			}
			return resolve(body);
		});
	});

	return setTransactionPromise;
}

module.exports = doTransaction;
