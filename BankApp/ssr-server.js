const express = require ('express');

//this is apparently needed for me to examine reuqest bodies
const mysql = require('mysql');
const pool = mysql.createPool({
  connectionLimit:30,
  host:'localhost',
  user:'root',
  password:'rootroot',
  database:'banking',
  debug:false,
  timezone:'utc'
}); //edit this based on host
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
var session = require('express-session')
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
const api_key = "secret"
const cookieParser = require('cookie-parser');

passport.serializeUser(function(user,done){
  done(null,user);
});

passport.deserializeUser(function(user,done){ //TODO: multiple calls are happenning
  pool.query(`select User_id,First_name from Users where User_id = '${user.User_id}'`,function(err,rows){
    done(err,rows[0]); //should be only one result at most
  });
});

passport.use(
     new LocalStrategy({
       usernameField: 'email',
       passwordField: 'password'
     },
     function(email,password,done){
         pool.query(`select User_id,First_name from Users where email = '${email}' and User_password = '${password}'`,function(err,rows){
           console.log('Now within Passport!!!')
           if(err){
             return done(err);
           }
           else if (rows.length == 0) {
             return done(null,false, { message: rows });
           }
           else{
             return done(null,rows[0]);
           }
         });
     })
   );
function getFromDatabase(req,res,query){
  pool.query(query,function(err,rows){
    if(err){
      res.json({'error':true,'message':'Error occured'+err});
    }
    else{
      res.json(rows);
    }
  });
}

function insertToDatabase(req,res,insertStatement){
  pool.query(insertStatement,(err,response)=>{
    if(err){
      res.json({'error':true,'message':'Error occured'+err});
    }
    else{
      res.json(response);
    }
  });
}

function isLoggedIn(req,res, nextMid){
  if(req.session.passport !== undefined){
    nextMid();
  }
  else{
    res.redirect("/");
  }
}

function retrieve_user(req,res){
  pool.query(`select * from Users where User_id = '${req.params.User_id}'`,function(err,rows){
    if(err){
      res.json({'error':true,'message':'Error occured'+err});
    }
    else{
      res.json(rows[0]);
    }
  });
}

function email_occupied(req,res){
  console.log("In function!!");
  console.log(req.params);
  pool.query(`select * from Users where email = '${req.params.email}'`,function(err,rows){
    if(err){
      res.json(err);
    }
    else{
      if(rows.length == 0){
        res.json({"isValid":true});
      }
      else{
        res.json({"isValid": false, "message": "This email already exists"});
      }
    }
  });
}

function retrieve_Accounts(req,res){// CLEAN UP
  pool.query(`select * from Accounts where User_id = '${req.params.User_id}'`,function(err,rows){
    if(err){
      res.json({'error':true,'message':'Error occured'+err});
    }
    else{
      res.json(rows);
    }
  });
}

function retrieve_Accounts_ids(req,res){
  pool.query(`select Account_id,Type_name, Account_num from Accounts where User_id = '${req.params.User_id}'`,function(err,rows){
    if(err){
      res.json({'error':true,'message':'Error occured'+err});
    }
    else{
      res.json(rows);
    }
  });
}

function retrieve_Transactions(req,res){ // CLEAN UP
  let limiter = req.params.rowAmount == 0 ? '' : `limit 0, ${req.params.rowAmount}`;

  pool.query(`select amount,sender_account_id,receiver_account_id,date_time,\
    (select concat(First_name,' ',Last_name) from Users where User_id = (select User_id from Accounts where Account_id = Transactions.sender_account_id)) as sender_name , \
    (select concat(First_name,' ',Last_name) from Users where User_id = (select User_id from Accounts where Account_id = Transactions.receiver_account_id)) as receiver_name from Transactions \
    where sender_account_id ='${req.params.Account_id}' or receiver_account_id ='${req.params.Account_id}'\
    order by date_time desc `+limiter, function(err,rows){
      if(err){
        res.json({'error':true,'message':'Error occured'+err});
      }
      else{
        res.json(rows);
      }
    });
}

function retrieve_All_Transactions(req,res){
  let resArray = {};

  pool.query(`select Account_id from Accounts where User_id = '${req.params.User_id}'`,function(err,AccountRows){
    if(err){
      res.json({'error':true,'message':'Error occured'+err});
    }
    else{
      let counter = AccountRows.length;
      AccountRows.forEach(function(AccountRow){
        pool.query(`select amount, sender_account_id, receiver_account_id, date_time,(select concat(First_name,' ',Last_name) from Users where User_id = (select User_id from Accounts where Account_id = Transactions.sender_account_id)) as sender_name\
        ,(select concat(First_name,' ',Last_name) from Users where User_id = (select User_id from Accounts where Account_id = Transactions.receiver_account_id)) as receiver_name from Transactions \
          where sender_account_id ='${AccountRow['Account_id']}' or receiver_account_id ='${AccountRow['Account_id']}'\
          order by date_time desc limit 0, ${req.params.rowAmount}`,function(err,trans){
            if(err){
              console.log(err)
            }
            else{
              resArray[AccountRow['Account_id'].toString()] = trans;
              counter = counter - 1;

              if(counter == 0){
                console.log(resArray);
                res.json(JSON.parse(JSON.stringify(resArray)));
              }
            }
          });
      });
    }
  });
}

function retrieve_mixed_transactions(req,res){//CLEAN UP
  let limiter = req.params.rowAmount == 0 ? '' : `limit 0, ${req.params.rowAmount}`;

  let query =`select amount, sender_account_id, receiver_account_id, date_time,\
  (select concat(First_name,' ',Last_name) from Users where User_id = (select User_id from Accounts where Account_id = Transactions.sender_account_id)) as sender_name,\
    (select concat(First_name,' ',Last_name) from Users where User_id = (select User_id from Accounts where Account_id = Transactions.receiver_account_id)) as receiver_name\
   from Transactions\
   where '${req.params.User_id}' = (select User_id from Accounts where Account_id = Transactions.sender_account_id)\
    or '${req.params.User_id}' = (select User_id from Accounts where Account_id = Transactions.receiver_account_id)\
    order by date_time desc `+limiter;

  pool.query(query,function(err,rows){
    if(err){
      res.json({'error':true,'message':'Error occured'+err});
    }
    else{
      res.json(rows);
    }
  });
}

function retrieve_Bills(req,res){//CLEAN UP
  pool.query(`select * from Bills where Account_id = \
    (select Account_id from Accounts where User_id = '${req.params.User_id}' and Type_name = 'credit')`,function(err,rows){
    if(err){
      res.json({'error':true,'message':'Error occured'+err});
    }
    else{
      res.json(rows);
    }
  });
}

function retrieve_misses(req,res){
  let query = `select current_miss_amount from Bills where Account_id = \
  (select Account_id from Accounts where User_id = '${req.params.User_id}' and Type_name = 'credit')`;

  pool.query(query,function(err,rows){
    if(err){
      res.json({'error':true,'message':'Error occured'+err});
    }
    else{
      if(rows.length == 0 || rows[0]['current_miss_amount'] == 0){
        rows = [];
      }
      res.json(rows);
    }
  });
}

function retrieve_Payments(req,res){ //CLEAN UP
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

function insert_user(req,res){ //CLEAN UP
  let insertStatement = `Insert into Users \
   (First_name, Last_name, SSN, Address, Phone_num, User_password,Pin_num,email) \
   values('${req.body.First_name}','${req.body.Last_name}','${req.body.SSN}',\
     '${req.body.Address}','${req.body.Phone_num}','${req.body.User_password}',\
     '${req.body.Pin_num}','${req.body.email}')`;

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
    values('${req.body.accountType}',${req.body.initialAmount},'${req.user.User_id}','')`
  pool.query(insertStatement,(err,response)=>{
    if(err){
      res.json({'error':true,'message':'Error occured'+err});
    }
    else{
      res.redirect('/dashboard');
    }
  });
}

function set_main_account(req,res){
  console.log('**request using these values:')
  console.log(req.body)
  console.log(req.params)
  pool.query(`update Users set main_account_id = '${req.body.Account_id}'\
    where User_id = '${req.params.User_id}'`,(err,response)=>{
      if(err){
        res.json({'error':true,'message':'Error occured'+err});
      }
      else{
        console.log(response);
        res.json(response);
      }
    });
}


function general_transfer(req,res){ // for transfers between your own accounts
  console.log('**Self Transfer request body:')
  console.log(req.body);
  pool.query(`insert into Transactions(amount,sender_account_id,receiver_account_id) \
    values(${req.body.amount},'${req.body.sender_account_id}','${req.body.receiver_account_id}')`,(err,response)=>{
      if(err){
        res.json({'error':true,'message':'Error occured'+err});
      }
      else{
        res.redirect('/dashboard');
      }
  }); //IMPORTANT: If the error returned is  like ER_NO_REFERENCED_ROW_2, then one of the account ids could not be found
}

function cross_transfer(req,res){
  console.log('**Other user Transfer request body:')
  console.log(req.body)
  let insertStatement = `insert into Transactions(amount,sender_account_id,receiver_account_id) \
    values(${req.body.amount},'${req.body.sender_account_id}',\
    (select main_account_id from Users where email = '${req.body.email}'))`;
  pool.query(insertStatement,(err,response)=>{
    if(err){ //one possible error is that the receiver has no main account set. So no account with id=null will be found
             //Error for that will read  ER_BAD_NULL_ERROR
      res.json({'error':true,'message':'Error occured'+err});
    }
    else{
      res.redirect('/dashboard');
    }
  });
}

function bill_payment(req,res){
  let insertStatement = `insert into Transactions(amount,sender_account_id,receiver_account_id) \
    values(${req.body.amount},'${req.body.sender_account_id}','000000000000000000000000000000000000')`;
  pool.query(insertStatement,(err,response)=>{
    if(err){ //one possible error is that the receiver has no main account set. So no account with id=null will be found
             //Error for that will read  ER_BAD_NULL_ERROR
      res.json({'error':true,'message':'Error occured'+err});
    }
    else{
      res.redirect('/dashboard');
    }
  });
}


app.prepare()
.then(() => {
  const server = express()


  // app.use(express.cookieParser());
// app.use(express.bodyParser());


  server.use(cookieParser('keyboard cat'));
  server.use(express.urlencoded());
  server.use(express.json())
  server.use(session({
    secret: 'keyboard cat',
    resave: true,
    name: 'bankSessionID',
    saveUninitialized: false
  }))
  server.use(passport.initialize())
  server.use(passport.session())


  server.get('/User/:User_id/:api_key', (req,res) =>{ //handles retriving user info, for log-in
    if(req.params.api_key == api_key){
      retrieve_user(req,res);
    }
    else{
      res.json({"error":"bad api key"});
    }
  });

  server.get('/User/emailExists/:email/:api_key',(req,res) =>{
    console.log('GET CALLED ***');
    console.log(req.params)
    if(req.params.api_key == api_key){
      console.log('Key approved***')
      email_occupied(req,res);
    }
    else{
      console.log('Key rejected**&*')
      res.json({"error":"bad api key"});
    }
  });

  server.get('/Accounts/:User_id/:api_key',(req,res)=>{ //handles retrieving all account info for a user
    if(req.params.api_key == api_key){
      retrieve_Accounts(req,res);
    }
    else{
      res.json({"error":"bad api key"});
    }
  });

  server.get('/Accounts/ids/:User_id/:api_key',(req,res)=>{
    if(req.params.api_key == api_key){
      retrieve_Accounts_ids(req,res);
    }
    else{
      res.json({"error":"bad api key"});
    }
  });

  server.get('/Transactions/:Account_id/:rowAmount/:api_key',(req,res)=>{ //retrieves all transaction involving the account
    if(req.params.api_key == api_key){
      retrieve_Transactions(req,res);
    }
    else{
      res.json({"error":"bad api key"});
    }

  });

  server.get('/Transactions/All/:User_id/:rowAmount/:api_key',(req,res)=>{
    if(req.params.api_key == api_key){
      retrieve_All_Transactions(req,res);
    }
    else{
      res.json({"error":"bad api key"});
    }
  });

  server.get('/Transactions/Mixed/:User_id/:rowAmount/:api_key',(req,res)=>{
    if(req.params.api_key == api_key){
      retrieve_mixed_transactions(req,res);
    }
    else{
      res.json({"error":"bad api key"});
    }
  });

  server.get('/Bills/:User_id/:api_key',(req,res)=>{ //retrieves any bill(1 possible) for the account
    if(req.params.api_key == api_key){
      retrieve_Bills(req,res);
    }
    else{
      res.json({"error":"bad api key"});
    }
  });

  server.get('/BillPayments/:Bill_id/:api_key',(req,res)=>{// retrieves transactions that were bill payments
    if(req.params.api_key == api_key){
      retrieve_Payments(req,res);;
    }
    else{
      res.json({"error":"bad api key"});
    }
  });

  server.get('/Bills/misses/:User_id/:api_key',(req,res)=>{

    if (req.params.api_key == api_key){
      retrieve_misses(req,res);
    } else{
      res.json({"error":"bad api key"});
    }
  });

  server.post('/User/:api_key',(req,res)=>{ //create new user account
    if (req.params.api_key == api_key){
      insert_user(req,res);
    } else{
      res.json({"error":"bad api key"});
    }

  });

  server.post('/User/:User_id/:api_key',(req,res)=>{ //update a user's choice of main account

    if (req.params.api_key == api_key){
        set_main_account(req,res);
    } else{
      res.json({"error":"bad api key"});
    }
  });

  server.post('/CreateAccount/:api_key',(req,res)=>{ //make a new banking account for the user
   if (req.params.api_key == api_key){
     insert_account(req,res);
   } else{
     res.json({"error":"bad api key"});
   }
  });

  server.post('/Transactions/:api_key',(req,res)=>{ //transfers between single user's accounts, deposits, and bill payments

    if (req.params.api_key == api_key){
      general_transfer(req,res);
    } else{
      res.json({"error":"bad api key"});
    }

  });

  server.post('/TransactionsOther/:api_key',(req,res)=>{ //cross user transfers
    if (req.params.api_key == api_key){
      cross_transfer(req,res);
    } else{
      res.json({"error":"bad api key"});
    }

  });

  server.post('/Transactions/Bill/:api_key',(req,res)=>{
    if (req.params.api_key == api_key){
      bill_payment(req,res);
    } else{
      res.json({"error":"bad api key"});
    }
  });


  server.get('/dashboard', isLoggedIn, (req, res) => {
    app.render(req, res, "/dashboard");
  });


  server.get('/signout',function(req,res){
    req.logout();
    req.session.passport = undefined;
    res.redirect('/');
  });

  server.post('/login/:api_key', (req, res, nextMid) => {
    if (req.params.api_key == api_key){
      if(req.body.isSignUp == "true"){
        registerUser(req, (req) => {
          registerAccount(req, () => {
            console.log('User and account have been inserted!');
            nextMid()
          });

        });
      } else {
        nextMid()
      }
    }
    else{
      res.json({"error":"bad api key"});
    }
  }, passport.authenticate('local', { successRedirect: '/dashboard',failureRedirect:'/'}));

  function registerUser(req, completion){
    console.log('************');
    console.log(req.body);
    let insertStatement = `Insert into Users \
     (First_name, Last_name, SSN, Address, Phone_num, User_password,Pin_num,email) \
     values('${req.body.firstName}','${req.body.lastName}','${req.body.ssn}',\
       '${req.body.address}','${req.body.phone}','${req.body.password}',\
       '','${req.body.email}')`;

    pool.query(insertStatement,function(err,response){
      if(err){
        console.log('Error******')
        console.log(err)
        res.json(err);
      }
      else{
        console.log('Success')
        completion(req)
      }
    });
  }
  function registerAccount(req, completion){
    let insertStatement = `insert into Accounts(Type_name,Balance,User_id,Card_num)\
      values('${req.body.accountType}',500,(select User_id from (select * from Users) as temp where email = '${req.body.email}'),'')`;

    pool.query(insertStatement,function(err,response){
      if(err){
        // remove created User
        pool.query(`delete from Users where email = '${req.body.email}'`);
        //console.log(err);
        return false;
      }
      else{
        //update Users set main_account_id =(select Account_id from Accounts where User_id = Users.User_id) where email ='${req.body.email}'
        pool.query(`update Users set main_account_id =(select Account_id from Accounts where User_id = Users.User_id) where email ='${req.body.email}'`, function(err,response){
          if(err){
            console.log('ERROR !!!!!!! : COULD NOT UPDATE USER TUPLE MAIN-ACCOUNT-ID ON SIGNUP ')
          }
          else{
            completion()
          }
        });
      }
    });
  }

  server.get('*', (req, res) => {
    return handle(req, res)
  })
// // // //


server.listen(3000, (err) => {
  if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})
.catch((ex) => {
  console.error(ex.stack)
  process.exit(1)
})
