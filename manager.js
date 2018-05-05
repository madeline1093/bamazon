let inquirer = require("inquirer");
let mysql = require("mysql");
require('console.table');

let connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: "bamazon",
});

connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
    }
    displayMenu();
});

function displayMenu() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'menu',
            message: 'Please select from the menu list',
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
        }
    ]).then(function(val) {
        //console.log('hello');
        //console.log(JSON.stringify(val, null, '  '));
        //console.log(JSON.stringify(val.menu))
        //console.log((val.menu) + " testing");
        let menuChoice = val.menu;

        if (menuChoice === 'View Products for Sale') {
            console.log("View products for sale");
            viewProducts();
        } else if (menuChoice === "View Low Inventory") {
            console.log("view low inventory")
            viewLowInventory();
        } else if (menuChoice === "Add to Inventory") {
            console.log('add more inventory');
            addInventory();
        } 
    });
};

function viewProducts() {
        let query = 'SELECT * FROM products';
        connection.query(query, function(err, res) {
            if (err) throw (err);
            // show the products
            console.table(res);

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'return',
                    message: 'Return to menu?',
                    choices: ["Yes", "No"],
                }
            ]).then(function(val) {

                let returnChoice = val.return;
                //console.log(returnChoice);
                if (returnChoice === 'Yes') {
                    console.log("View products for sale");
        
                   displayMenu();
                } else if (returnChoice === "No"){
                    console.log("Guess you'll stay here in limbo then");
                }
            });
        });
};

function viewLowInventory() {
    let query = 'SELECT * FROM products WHERE stock_quantity < 5';
    connection.query(query, function(err, res) {
        if (err) throw (err);
        console.table(res); 

    });
    menuChoice();
}

function addInventory(){

    //what product do you want to add to?
    //how many do you want to add?
    inquirer.prompt([
        {
            type: 'input',
            name: 'item',
            message: 'What is the ID of the item you would like to add more to?',
        },

        {
            type: 'input',
            name: 'quantity',
            message: 'How much do you want to add to the products inventory?'
        }
    ]).then(function(val) {
        //console.log('hello');
        let choiceID = parseInt(val.item);
        let itemNum = parseInt(val.quantity);
        //consolelog(choiceID + " " + itemNum);

        let query = 'SELECT * FROM products WHERE ?';
        connection.query(query, {item_id: choiceID}, function(err, res) {
            if (err) throw (err);
            // show the products
            console.table(res);
            if (res.length === 0) {
                console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
				addInventory();
            } else {
                let productData = res[0];

                console.log("adding new inventory");
                
                let newQuery = "UPDATE products SET stock_quantity = " + (productData.stock_quantity + itemNum) + " WHERE item_id = " + choiceID;

                connection.query(newQuery, function(err, res) {
                    if (err) throw (err);
                    console.log('Stock for item ' + choiceID + " has been updated to " + productData.stock_quantity + itemNum + ".");
				});
			};
		});
	});
};