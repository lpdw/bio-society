'use strict'
var router = require('express').Router();
const IndexService = require('../services/index');
const OrderService = require('../services/orders');
var request = require('request');
var Transaction = require('../lib/transaction');
router.get('/',function(req,res,next){
	res.render('index',{title:"Je suis une home"});
});

// Affiche tout les produits
router.get('/products', function(req, res, next) {
	// On défini l'accès de la request
	
	var options = {
	  uri: 'https://senorpaparobot.herokuapp.com/products',
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
	  uri: `https://senorpaparobot.herokuapp.com/products/type/${req.params.type}`,
	  method: 'GET',
	  json:true,
	  headers: {'authorization': 'lpdw-2016'}
	};
	// On récupère tout les produits du producteur
	request(options, function(error, response, body){
	    if(error) console.log(error);
	    else return res.render('products',{products: body});
	})
});

router.post('/buy', function (req,res,next) {
	//Clear panier
	// let commande = OrderService.create({});
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
				url: `https://senorpaparobot.herokuapp.com/products/${i}`,
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
		
		// On affiche un message avec la valeur
		p.then(function(val) {
	      	panier.data.push(val);
	      	panier.total =  + Number((parseInt(val.quantity) * val.price)+panier.total).toFixed(2);
			
			// commande.userId = req.user.id;
			// commande.data = JSON.stringify(panier.data);
			
			if(panier.data.length == Object.keys(req.body).length){
				//Send data to products
				req.session.panier = panier;
				res.render('panier',{products: panier});
			}
	    }).catch(
	      // Promesse rejetée
	      function() {
	        console.log("promesse rompue2");
	    });
	}
});

//Envoie de données vers la banque
router.post('/panier', function(req, res, next) {

	let p = new Promise((resolve, reject) => {
		request({
		    url: `https://senorpaparobot.herokuapp.com/command`,
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

  	let jsonData = {"type":2,"payer":req.body.cardNumber,"status":1,"amount":req.session.panier.total,"message":"Merci Jacquie et Michel !","beneficiary":"010203040506","token":req.body.token};

	let transaction = Transaction.doTransaction(jsonData);
	transaction.then(function(transaction_id) {
		// Succès, l'argent est bloqué sur le compte de l'acheteur.
		
		// On envoie la commande au producteur.
		p.then(function(id_suivi) {
			console.log(id_suivi);
	      	req.session.panier.id_suivi = id_suivi;
	      	let comfirmTransaction = Transaction.confirmTransaction(transaction_id, {status: 2});
	      	comfirmTransaction.then(function(val) {
	      		// succès, la commande est passée et l'argent a été débité.
	      		res.send("Félicitation, la commande est passée et l'argent a été débité");
	      	}).catch(function(err) {
				// La commande est passée mais le virement a échoué.
				res.send("Dommage, la commande est passée mais le virement a échoué");
	      	});
	    // Le producteur n'a pas pu honoré sa commande.
	    }).catch(function() {
	    	let comfirmTransaction = Transaction.confirmTransaction(transaction_id, {status: 0});
	        comfirmTransaction.then(function(val) {
	        	// Succès, l'argent a bien été rendu à l'acheteur.
	        	res.send("Félicitation, l'argent vous a bien été rendu");
	      	}).catch(function(err) {
	      		// La commande n'est pas passée et le remboursement de l'acheteur a échoué.
	      		res.send("Attention, votre commande n'est pas passée et le remboursement de l'acheteur n'a pas pu aboutir !");
	      	});
	        console.log("promesse rompue");
	    });
	}).catch(function(err) {
		// L'acheteur n'a pas assez d'argent.
		res.send("Transaction annulée, fond insuffisant");
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
