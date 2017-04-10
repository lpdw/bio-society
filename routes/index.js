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

	let panier = {"id_commande":"","data":[],"total":0,"id_suivi":"","lastname":req.user.lastname,"firstname":req.user.firstname,"address":req.user.address,"postcode":req.user.postcode,"phone_number":req.user.phone_number};
	// construct data
	let commande = {};
	let id;
	commande.user = req.user.id;
	OrderService.create(commande)
	    .then(commande => {
	        id = commande.id;
			panier.id_commande = id;
	    });

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
			
			if(panier.data.length == Object.keys(req.body).length){
				let data = {data : JSON.stringify(panier.data), total: panier.total, statut: "non finalisée"};
		        OrderService.updateById(id, data);
				//Send data to products
				req.session.panier = panier;
				res.render('panier',{products: panier});
			}
	    }).catch(
	      // Promesse rejetée
	      function() {
			OrderService.updateById(id, {statut: "annulée"});
			console.log("promesse rompue");
	    });
	}
});

//Envoie de données vers la banque
router.post('/panier', function(req, res, next) {

  	let jsonData = {"type":2,"payer":req.body.cardNumber,"status":1,"amount":req.session.panier.total,"message":"Paiement de votre commande sur Bio Society","beneficiary":"bAZBtCNvP2pUOsya","token":req.body.token};

	let transaction = Transaction.doTransaction(jsonData);
	// Succès, l'argent est bloqué sur le compte de l'acheteur.
	transaction.then(function(transaction_id) {
		// On envoie la commande au producteur.
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
		// La commande est passée auprès du producteur.
		p.then(function(id_suivi) {
			console.log(id_suivi);
	      	req.session.panier.id_suivi = id_suivi;
			OrderService.updateById(req.session.panier.id_commande, {carte_bleue: req.body.cardNumber, id_suivi : id_suivi});
	      	let comfirmTransaction = Transaction.confirmTransaction(transaction_id, {status: 2});
	      	comfirmTransaction.then(function(val) {
	      		// succès, la commande est passée et l'argent a été débité.
				OrderService.updateById(req.session.panier.id_commande, {statut : "acceptée"});
	      		res.send("Félicitation, la commande est passée et l'argent a été débité");
	      	}).catch(function(err) {
				// La commande est passée mais le virement a échoué.
				res.send("Dommage, la commande est passée mais le virement a échoué");
	      	});
	    // Le producteur n'a pas pu honoré sa commande.
	    }).catch(function() {
	    	let comfirmTransaction = Transaction.confirmTransaction(transaction_id, {status: 0});
	        // Succès, l'argent a bien été rendu à l'acheteur.
	        comfirmTransaction.then(function(val) {
				OrderService.updateById(req.session.panier.id_commande, {statut : "remboursée"});
	        	res.send("Félicitation, l'argent vous a bien été rendu");
	      	// La commande n'est pas passée et le remboursement de l'acheteur a échoué.
	      	}).catch(function(err) {
	      		res.send("Attention, votre commande n'est pas passée et le remboursement de l'acheteur n'a pas pu aboutir !");
	      	});
	        console.log("promesse rompue");
	    });
	   // L'acheteur n'a pas assez d'argent.
	}).catch(function(err) {
		OrderService.updateById(req.session.panier.id_commande, {statut : "annulée"});
		res.send("Transaction annulée, fond insuffisant");
	});

});

router.get('/orders', function(req, res, next){
	OrderService.findByQuery({user : req.user.id})
		.then(orders => {
			res.render('orders', {orders: orders});
		})
	;
});

module.exports = router;
