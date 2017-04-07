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
				res.render('panier',{products: req.body});
			}
	    }).catch(
	      // Promesse rejetée
	      function() { 
	        console.log("promesse rompue");
	    });
	}
});

//Envoie de données vers la banque
router.post('/panier', function(req, res, next) {
	// On défini l'accès de la request	
	var options = {
	  uri: 'https://senorpapa.herokuapp.com/products/',
	  json:true,
	  headers: {
	  	'Accept': 'application/json'
	  }
	};

	//Création de l'id de transaction
	console.log('-------------RANDOM-------------');
    var randomNum = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 5; i++ )
        randomNum += possible.charAt(Math.floor(Math.random() * possible.length));

	request.post(options, function(error, response, body){
		console.log('---------Panier---------');
		let jsonData = req.body;
		jsonData["bioSocietyAcount"] = "010203040506";
		jsonData["type"] = "payement";
		jsonData["amount"] = "19,99";
		jsonData["transactionId"] = randomNum;
		console.log(jsonData);
		//let test = JSON.stringify(req.body);		
	    if(error) console.log(error);
	    else return res.render('index',{products: body}); 
	});
});

module.exports = router;
