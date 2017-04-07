var router = require('express').Router();
const IndexService = require('../services/index');
var request = require('request');
let panier = {id_commande:"",data:[],total:0,id_suivi:""}
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
			if(panier.data.length == Object.keys(req.body).length){
				//Send data to products
				console.log(panier);
				res.render('panier',{products: panier});
			}
	    }).catch(
	      // Promesse rejetée
	      function() {
	        console.log("promesse rompue");
	    });
	}
});

const verifProduct = (data) =>{
	// let p = new Promise((resolve, reject) => {
	// 	request({
	// 	    url: `https://senorpapa.herokuapp.com/`,
	// 	    method: "POST",
	// 	    json: true,
	// 	    headers: {
	// 	        "content-type": "application/json",
	// 	        'authorization': 'lpdw-2016'
	// 	    },
	// 	    body: JSON.stringify(result)
	// 	}, (error, response, body) => {
	// 		if (error) {
	// 			return reject(error)
	// 		}
	// 		let temp = JSON.parse(response.body);
	// 		temp.quantity = req.body[temp.id];
	// 		return resolve(temp);
	// 	})
	// });
	// TO DO send data to products and return response
	return true;
}
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
		jsonData["amount"] = panier.total;
		jsonData["transactionId"] = randomNum;
		console.log(jsonData);
		//let test = JSON.stringify(req.body);		
	    if(error) console.log(error);
	    else return res.render('index',{products: body}); 
	});
});

module.exports = router;
