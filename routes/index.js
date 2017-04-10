'use strict'
var router = require('express').Router();
const IndexService = require('../services/index');
const OrderService = require('../services/orders');
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
	//Clear panier
	let commande = OrderService.create({});
	let panier = {"id_commande":"","data":[],"total":0,"id_suivi":"","lastname":req.user.lastname,"firstname":req.user.firstname,"address":req.user.address,"postcode":req.user.postcode,"phone_number":req.user.phone_number};
	// construct data
	panier.id_commande = Math.random().toString(36).substr(2, 15).toUpperCase();
	for(var i in req.body){
		if(req.body[i] == 0){
			delete req.body[i];
		}
	}
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
	      	panier.data.push(val);
	      	panier.total =  + Number((parseInt(val.quantity) * val.price)+panier.total).toFixed(2);
			
			commande.userId = req.user.id;
			commande.data = JSON.stringify(panier.data);
			
			if(panier.data.length == Object.keys(req.body).length){
				//Send data to products
				req.session.panier = panier;
				res.render('panier',{products: panier});
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

	let p = new Promise((resolve, reject) => {
		request({
		    url: `https://senorpapa.herokuapp.com/command`,
		    method: "POST",
		    json: true,
		    headers: {
		        "content-type": "application/json",
		        "authorization": "lpdw-2016"
		    },
		    body: req.session.panier
		}, (error, response, body) => {
			if (error) {
				return reject(error)
			}
			return resolve(response.body);
		})
	});
	p.then(
    	// On affiche un message avec la valeur
    	function(val) {
      	console.log("Show val : ",val);
      	req.session.panier.id_suivi = val;

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
			jsonData["amount"] = req.session.panier.total;
			jsonData["transactionId"] = randomNum;
			console.log(jsonData);
			//let test = JSON.stringify(req.body);		
		    if(error) console.log(error);
		    else return res.render('index',{products: body}); 
		});
    }).catch(
      // Promesse rejetée
      function() {
        console.log("promesse rompue");
    });

});

router.get('/orders', function(req, res, next){
	OrderService.findByQuery({userId : req.user.id})
		.then(orders => {
			res.render('orders', {orders: orders});
		})
	;
});

module.exports = router;
