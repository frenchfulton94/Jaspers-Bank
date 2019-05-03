const express = require ('express');
const app = express();
app.use(express.json()); //this is apparently needed for me to examine reuqest bodies
const mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit:30,
  host:'localhost',
  user:'root',
  password:'rootroot',
  database:'banking',
  debug:false
}); //edit this based on host

function retrieve_user(req,res){
  pool.query(`select * from Users where email = '${req.params.email}'and \
   User_password = '${req.params.password}'`,function(err,rows){
    if(err){
      res.json({'error':true,'message':'Error occured'+err});
    }
    else{
      res.json(rows);
    }
  });
}

function retrieve_Accounts(req,res){
  pool.query(`select * from Accounts where User_id = '${req.params.User_id}'`,function(err,rows){
    if(err){
      res.json({'error':true,'message':'Error occured'+err})
    }
    else{
      res.json(rows);
    }
  });
}

function retrieve_Transactions(req,res){
  pool.query(`select * from Transactions \
    where sender_account_id ='${req.params.Account_id}' or receiver_account_id ='${req.params.Account_id}'\
    order by date_time desc`, function(err,rows){
      if(err){
        res.json({'error':true,'message':'Error occured'+err});
      }
      else{
        res.json(rows);
      }
    });
}

function retrieve_Bills(req,res){
  pool.query(`select * from Bills where Account_id = '${req.params.Account_id}'`,function(err,rows){
    if(err){
      res.json({'error':true,'message':'Error occured'+err});
    }
    else{
      res.json(rows);
    }
  });
}

function retrieve_Payments(req,res){
  pool.query(`select * from Transactions where Transaction_id in \
    (select Transaction_id from payment_for_bill where Bill_id = '${req.params.Bill_id}' )`,function(err,rows){
      if(err){
        res.json({'error':true,'message':'Error occured'+err});
      }
      else{
        res.json(rows);
      }
    });
}

function insert_user(req,res){
  let insertStatement = `Insert into Users \
   (First_name, Last_name, SSN, Address, Phone_num, User_password,Pin_num,email) \
   values('${req.body.First_name}','${req.body.Last_name}','${req.body.SSN}',\
     '${req.body.Address}','${req.body.Phone_num}','${req.body.User_password}',\
     '${req.body.Pin_num}','${req.body.email}')`;

  //console.log(formattedStatement);
  pool.query(insertStatement,(err,response) =>{ // for some reason 'function' is not used?
    if(err){
      res.json({'error':true,'message':'Error occured'+err});
    }
    else{
      res.json(response);
    }
  });
}

function insert_account(req,res){
  let insertStatement = `insert into Accounts(Type_name,Balance,User_id,Card_num)\
    values('${req.body.Type_name}',${req.body.Balance},'${req.body.User_id}','${req.body.Card_num}')`
  pool.query(insertStatement,(err,response)=>{
    if(err){
      res.json({'error':true,'message':'Error occured'+err});
    }
    else{
      res.json(response);
    }
  });
}

function set_main_account(req,res){

  pool.query(`update Users set main_account_id = '${req.body.main_account_id}'\
    where User_id = '${req.params.User_id}'`,(err,response)=>{
      if(err){
        res.json({'error':true,'message':'Error occured'+err});
      }
      else{
        res.json(response);
      }
    });
}

function general_transfer(req,res){ //testing between accounts : working, deposit:working ,bill payment:working
  pool.query(`insert into Transactions(amount,sender_account_id,receiver_account_id) \
    values(${req.body.amount},'${req.body.sender_account_id}','${req.body.receiver_account_id}')`,(err,response)=>{
      if(err){
        res.json({'error':true,'message':'Error occured'+err});
      }
      else{
        res.json(response);
      }
  }); //IMPORTANT: If the error returned is  like ER_NO_REFERENCED_ROW_2, then one of the account ids could not be found
}

function cross_transfer(req,res){
  let insertStatement = `insert into Transactions(amount,sender_account_id,receiver_account_id) \
    values(${req.body.amount},'${req.body.sender_account_id}',\
    (select main_account_id from Users where email = '${req.params.email}'))`;
  pool.query(insertStatement,(err,response)=>{
    if(err){ //one possible error is that the receiver has no main account set. So no account with id=null will be found
             //Error for that will read  ER_BAD_NULL_ERROR
      res.json({'error':true,'message':'Error occured'+err});
    }
    else{
      res.json(response);
    }
  });
}

app.get('/User/:email/:password', (req,res) =>{ //handles retriving user info, for log-in
  retrieve_user(req,res);
  //res.send([req.params.email,req.params.password]);
});

app.get('/Accounts/:User_id',(req,res)=>{ //handles retrieving all account info for a user
  retrieve_Accounts(req,res);
});

app.get('/Transactions/:Account_id',(req,res)=>{ //retrieves all transaction involving the account
  retrieve_Transactions(req,res);
});

app.get('/Bills/:Account_id',(req,res)=>{ //retrieves any bill(1 possible) for the account
  retrieve_Bills(req,res);
});

app.get('/BillPayments/:Bill_id',(req,res)=>{// retrieves transactions that were bill payments
  retrieve_Payments(req,res);
});

app.put('/User',(req,res)=>{ //create new user account
  insert_user(req,res);
});

app.post('/User/:User_id',(req,res)=>{ //update a user's choice of main account
  set_main_account(req,res);
});

app.put('/Accounts',(req,res)=>{ //make a new banking account for the user
  insert_account(req,res);
});

app.put('/Transactions',(req,res)=>{ //transfers between single user's accounts, deposits, and bill payments
  general_transfer(req,res);
});

app.put('/Transactions/:email',(req,res)=>{ //cross user transfers
  cross_transfer(req,res);
});

//TODO: Debug paying a Bill. Also should bills be creatable by request???

const server = app.listen(3000,() => console.log('Listening on port 3000'));

process.on('SIGINT', ()=>{ //for a complete shutdown on CTRL+C from terminal
  pool.end();
  server.close(()=>{
    console.log('Api services have ended.')
  });
})
