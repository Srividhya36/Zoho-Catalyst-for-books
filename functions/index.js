'use strict';

var express = require('express');
var app = express();
var catalyst = require('zcatalyst-sdk-node');
app.use(express.json());

/*tablename - Employees
empid - int, mandatory, unique
empname - text, mandatory*/

/*Please handle validation checks, this is just boilerplate code
For example, validation checks for inputs and params */

/*Read*/
app.get('/select', (req, res) => {
	//initialize catalyst instance
	var catalystApp = catalyst.initialize(req);
	//fetch url parameter
	var emp_id = req.query.eno;
	console.group(emp_id);
	//fetch from datastore with emp_id
	getDatafromDS(catalystApp, emp_id,'Employees').then( response =>{
			//Success response
			console.log(response);
			res.send(response);
		}).catch(err => {
			//error response
    console.log(err);
    sendErrorResponse(response);
	})
});


/*Create*/
/*curl --location --request POST 'http://localhost:3000/server/anurag_demo_function/insert_rows' \
--header 'Content-Type: application/json' \
--data-raw '{
    "empname":"Mary Doe",
    "empid":3
}'*/
app.post('/insert_rows', (req, res) => {
	//initialize catalyst instance
	var catalystApp = catalyst.initialize(req);
	//initialize datastore component
	var datastore = catalystApp.datastore();
	//specify rowData as json
	var rowData = req.body;
	console.log(req.body)
	//select table to insert rows
    let table = datastore.table('Employees');
    let insertPromise = table.insertRow(rowData);
	// insert rows in a promise; Handle success and failure cases
    insertPromise.then((row) => {
		//success response
            console.log(row);
			res.send(row);
        }).catch(err => {
			//error response
			console.log(err);
			sendErrorResponse(err);
			});
	
});

/*Update rows*/
/*curl --location --request PATCH 'http://localhost:3000/server/anurag_demo_function/upd_rows' \
--header 'Content-Type: application/json' \
--data-raw '{
    "update":{
        "empid":128,
        "empname":"Christian McGale"
    },
    "eno":125
}'*/ 
app.patch('/upd_rows', (req, res) => {
	//initialize catalyst instance
	var catalystApp = catalyst.initialize(req);
	var updatedRowData = req.body.update;
	console.log("Body"+req.body);
	//fetch rowid for empid
	getDatafromDS(catalystApp,req.body.eno,"Employees").then(response =>{
		console.log(response)
		updatedRowData.ROWID = response[0].Employees.ROWID;
		//initialize data store instance
		let datastore = catalystApp.datastore();
		let table = datastore.table('Employees');
		console.log(updatedRowData)
		//update the table row
		let rowPromise = table.updateRow(updatedRowData);
		rowPromise.then((row) => {
				console.log(row);
				res.send(row);
			}).catch(err => {
				console.log(err);
				sendErrorResponse(res);
				});
	})

   
	
});


/*Delete Rows*/
/*curl --location --request DELETE 'http://localhost:3000/server/anurag_demo_function/del_rows' \
--header 'Content-Type: application/json' \
--data-raw '{
    "id":2
}'*/
app.delete('/del_rows', (req, res) => {
	//initialize catalyst instance
	var catalystApp = catalyst.initialize(req);
	//initialize data store instance
	let datastore = catalystApp.datastore();
	let table = datastore.table('Employees');

	var empid = req.body.id;
	//fetch rowid for empid
	getDatafromDS(catalystApp,empid,"Employees").then(response =>{

		var rowid = response[0].Employees.ROWID;
		let rowPromise = table.deleteRow(rowid);
		rowPromise.then((row) => {
            console.log(row);
			req.send("success");
        }).catch(err => {
			console.log(err);
			sendErrorResponse(res);
			});
	})
	
	
});

function getDatafromDS(catalystApp, eno,tablename){
	return new Promise((resolve, reject) => {
	  // Queries the Catalyst Data Store table
	  catalystApp.zcql().executeZCQLQuery("Select * from "+tablename+" where "+"empid='" + eno + "'").then(queryResponse => {
	   resolve(queryResponse);
	  }).catch(err => {
	   reject(err);
	  })
	 });
}
module.exports = app;
