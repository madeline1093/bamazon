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
// test connection
connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
    }
    loadProducts();
});

function loadProducts() {
    let query = 'SELECT * FROM products';
    connection.query(query, function(err, res) {
        if (err) throw (err);
        // show the products
        console.table(res);

        // prompt customer for product
        promptCustomerForItem(res);
    });
}

function promptCustomerForItem(inventory) {
    inquirer.prompt([
        {
            type: 'input',
            name: 'choice',
            message: 'What is the ID of the item you would like to purchase?',
        }
    ]).then(function(val) {
        //console.log('hello');
        let choiceId = parseInt(val.choice);
        // query products to see if have enough
        let product = checkInventory(choiceId, inventory);
        if (product) {
            //console.log("hello");
            promptCustomerForQuantity(product);
        } else {
            console.log('That item is not in our inventory');
            loadProducts();
        }
    });
}

function promptCustomerForQuantity(product) {
    inquirer.prompt([
        {
            type: 'input',
            name: 'quantity',
            message: 'How many would you like of that product?',
        }
    ]).then(function(val) {
        let quantity = parseInt(val.quantity);
        if (quantity > product.stock_quantity) {
            console.log('not enough');
            loadProducts();
        } else {
            console.log('great, lets box this up!');
            makePurchase(product, quantity);
        }
    })
}

function makePurchase(product, quantity) {
    connection.query(

        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?',
        [quantity, product.item_id],
        function(err, res) {
            if (err) throw (err);
            console.log('success');
            loadProducts();
        }

    )
}

function checkInventory(choiceId, inventory) {
    for(var i=0; i < inventory.length; i++) {
        if (inventory[i].item_id === choiceId) {
            return inventory[i];
        }
    }
    return null;
}