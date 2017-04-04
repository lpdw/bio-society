var router = require('express').Router();
const IndexService = require('../services/index');
var request = require('request');
var options = {
  uri: 'https://senorpapa.herokuapp.com/products',
  method: 'GET',
  json:true
};
/* GET home page. */
router.get('/', function(req, res, next) {
	request(options, function(error, response, body){
	    if(error) console.log(error);
	    else return res.render('index',{products: body}); 
	});
});

router.post('/buy', function (req,res,next) {
	var options = {
	  method: 'GET',
	  json:true
	};
	let data = [];
	for(var i in req.body){
		// options.uri =`https://senorpapa.herokuapp.com/products/${i}`;
		// request(options, function(error, response, body){
		//     if(error) console.log(error);
		//     else{
		//     	body.quantity -= req.body[body.id];
		//     	console.log(body);
		//     	data.push(body);
		//     };
		// });

		let p = new Promise((resolve, reject) => {
			request({
				url: `https://senorpapa.herokuapp.com/products/${i}`,
				method: 'GET',
				headers: {
					'Accept': 'application/json'
				}
			}, (error, response, body) => {
				if (error) {
					return reject(error)
				}
				let temp = JSON.parse(response.body);
				// console.log(req.body);
				// console.log('body id ');
				// console.log(temp.id);
				// console.log('val quantity');
				// console.log(req.body[temp.id]);
				// console.log('val de body');
				temp.quantity = req.body[temp.id];
				// console.log(temp);
				console.log('Send promise');
				return resolve(temp);
			})
		});

		p.then(
	    // On affiche un message avec la valeur
	    function(val) {
	      console.log(val);
	      data.push(val);
		console.log(data);
	    }).catch(
	      // Promesse rejetée
	      function() { 
	        console.log("promesse rompue");
	      });
		// getProduct(i,req.body)
		// 	.then(res => data = res)
		// 	.catch(err => console.log('Error: ', error));
	}
	// console.log(req.body);
	res.send("Its ok ");
});

function getProduct(i,req) {
	return new Promise((resolve, reject) => {
		request({
			url: `https://senorpapa.herokuapp.com/products/${i}`,
			method: 'GET',
			headers: {
				'Accept': 'application/json'
			}
		}, (error, response, body) => {
			if (error) {
				return reject(error)
			}
			console.log(req);
			console.log(body);
			console.log(body["id"]);
			body.quantity -= req[body.id];
			// console.log(body);
			return resolve(body);
		})
	});
}


module.exports = router;
