const nodemailer = require('nodemailer');
const mysql = require('mysql');
const schedule = require('node-schedule');

var timer = schedule.scheduleJob('20 * * * *',function(){//first digit is what minute of the hour

  const pool = mysql.createPool({
    poolLimit:30,
    host:'localhost',
    user:'root',
    password:'rootroot',
    database:'banking',
    debug:false
  });

  const transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
      user: // make a new gmail and put the auth here
      pass:
    }
  });

  function cleanUpTransactions(transactionRows,Account_id){
    var htmlString ="";
    for (trans of transactionRows){
      if(trans['sender_account_id'] === '000000000000000000000000000000000000'){
        htmlString = htmlString.concat(`<p> <b>Deposit: Amount =<font color="green"> +$${trans['amount']}</font></b> on ${trans['date_time']}</p>`);
      }
      else if (trans['receiver_account_id'] === '000000000000000000000000000000000000') {
        htmlString = htmlString.concat(`<p> <b>Bill Payment: Amount =<font color="red"> -$${trans['amount']}</font></b> on ${trans['date_time']}</p>`);
      }
      else{

        if(trans[`receiver_account_id`] === Account_id){
          htmlString = htmlString.concat(`<p> <b>From:</b>${trans['sender_name']} <b>Amount =<font color="green"> +$${trans['amount']}</font></b> on ${trans['date_time']}</p>`);
        }
        else{
          htmlString = htmlString.concat(`<p> <b>To:</b>${trans['receiver_name']} <b>Amount = <font color="red">-$${trans['amount']}</font></b> on ${trans['date_time']}</p>`);
        }
        //htmlString = htmlString.concat(`<p> Sender:${trans['sender_account_id']} Receiver:${trans['receiver_account_id']} amount = $${trans['amount']} on ${trans['date_time']}</p>`);
      }
    }
    if (transactionRows = 0){
      htmlString = "No transactions in the last month";
    }
    return htmlString;
  }

  pool.query(`select * from accounts where Account_id != '000000000000000000000000000000000000'`,function(err,accountRows){
    if(err){
      console.log(err);
    }
    console.log(accountRows.length)
    //async.each(accountRows,function(account,callback){
    accountRows.forEach(function(account){
      //console.log(account['User_id']);
      pool.query(`select (select concat(First_name,' ',Last_name) from Users where User_id = (select User_id from Accounts where Account_id = Transactions.sender_account_id)) as sender_name,\
       (select concat(First_name,' ',Last_name) from Users where User_id = (select User_id from Accounts where Account_id = Transactions.receiver_account_id)) as receiver_name,\
       amount, date_time, Transaction_id, sender_account_id, receiver_account_id from Transactions where (sender_account_id='${account['Account_id']}' or \
        receiver_account_id='${account['Account_id']}') and date_time > (now() - interval 1 month) `,function(err,transactionRows){
          if(err){
            console.log(err);
          }
          pool.query(`select email from Users where User_id = '${account['User_id']}'`,function(err,emailRow){
            if(err){
              console.log(err);
            }
            else{
              var transactionsString = cleanUpTransactions(transactionRows,account['Account_id']);
              var letter = {
                from: 'gradDBmailer@gmail.com',
                to: `${emailRow[0]['email']}`,
                subject:`Monthly statement for account: ${account['Type_name']}`,
                html: transactionsString
              };
              //console.log(letter);
              transporter.sendMail(letter, function(err,info){
                if(err){
                  console.log(err);
                }
                else{
                  console.log(info);
                }
              });
            }
            //pool.end();
            //console.log(`${account['Account_id']}, ${emailRow[0]['email']} transactions: `);
            //console.log(transactionRows);
          });
        });
    });
  });
});
