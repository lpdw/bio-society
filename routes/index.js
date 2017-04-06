var router = require('express').Router();
const IndexService = require('../services/index');
var request = require('request');

router.get('/',function(req,res,next){
	res.render('index',{title:"Je suis une home"});
});

// Affiche tout les produits
router.get('/products', function(req, res, next) {
	// On défini l'accès de la request
	var options = {
	  uri: 'https://senorpapa.herokuapp.com/products',
	  method: 'GET',
	  json:true,
	  headers: {'authorization': 'lpdw-2016'}
	};
	// On récupère tout les produits du producteur
	request(options, function(error, response, body){
	    if(error) console.log(error);
	    else return res.render('products',{products: body});
	});
});

// Affiche tout les produits par type
router.get('/products/:type', function(req, res, next) {
	// On défini l'accès de la request
	var options = {
	  uri: `https://senorpapa.herokuapp.com/products/type/${req.params.type}`,
	  method: 'GET',
	  json:true,
	  headers: {'authorization': 'lpdw-2016'}
	};
	// On récupère tout les produits du producteur
	request(options, function(error, response, body){
	    if(error) console.log(error);
	    else return res.render('products',{products: body});
	});
});

router.post('/buy', function (req,res,next) {
	// Panier to send
	let result = {id_commande:"",data:[]};
	// construct data
	for(var i in req.body){
		let p = new Promise((resolve, reject) => {
			request({
				url: `https://senorpapa.herokuapp.com/products/${i}`,
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'authorization': 'lpdw-2016'
				}
			}, (error, response, body) => {
				if (error) {
					return reject(error)
				}
				let temp = JSON.parse(response.body);
				temp.quantity = req.body[temp.id];
				return resolve(temp);
			})
		});

		p.then(
	    // On affiche un message avec la valeur
	    function(val) {
	      	result.data.push(val);
			if(result.data.length == Object.keys(req.body).length){
				//Send data to products
				console.log(result);
				res.send("Panier validé");
			}
	    }).catch(
	      // Promesse rejetée
	      function() {
	        console.log("promesse rompue");
	    });
	}
});


module.exports = router;
