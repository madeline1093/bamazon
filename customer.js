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

connection.connect(function(err){
    if (err){
        console.error('error connecting: ' +err.stack);
    }
    loadProducts();
    //console.log(connection.threadId);
})

function loadProducts() {
    let query = 'SELECT * FROM products';
    connection.query(query, function(err, res) {
        console.table(res);
        promptCustomerForItems(res);
    });
}

function promptCustomerForItems(inventory){
    inquirer.prompt([{
        type: 'input',
        name: 'choice',
        message: "Waht is the ID of the item you would like to purchase?",
    }]).then(function(val) {
        let choiceID = parseInt(val.choice);
        //query products to make sure there is enough in stock
        let product = checkInventory(choiceID, inventory);
        if (product) {
            promptCustomerForQuantity(product);
        } else {
            console.log("That item is out of stock!");
            loadProducts();
        }
    });
};

function checkInventory(choiceID, inventory) {
    for (let i = 0; i < inventory.length; i++) {
        if (inventory[i].item_id === choiceID) {
            //you have that item in your database
            return inventory[i];
        }
        return null;
    }
}

function promptCustomerForQuantity(){
    inquirer.prompt([{
        //promt for quantity
    }]).then(function(val){
        let quantity = parseInt(val.quantity);
        if (quantity > product.stock_quantity) {
            console.log("Not enough in stock")
        } else {
            makePurchase(product, quantity);
        }
    })
}

function makePurchase(product, quantity) {
    connection.query(
        //update datatbase
        "UPDATE products SET stock_quantity - ? WHERE item_id = ?",
        [quantity, product.item_id],
        function(err, res) {

        }
    )
}