show databases;
create database banking;
use banking;
show triggers;

create table Users(
	User_id char(36), 
    First_name varchar(20),
    Last_name varchar(20),
    SSN char(9) not null,
    Address varchar(200),
    Phone_num  char(10),
    User_password varchar(15),
    Pin_num char(4),
    email varchar(40) not null unique,
    main_account_id char(36),
    primary key (User_id)
    
    );

delimiter $$
create trigger user_start #trigger for preparing an incomplete user entry from the client side of the application
before insert on Users for each row
begin

	declare tempUserID varchar(36);
    
    if new.User_id is null then
		set @tempUserID = uuid();
		
		while exists(select * from Users where User_id = @tempUserID) do
			set tempUserID = uuid();
		end while;
			
		set new.User_id = @tempUserID;
        set new.main_account_id = null;
    end if;
end;
$$
delimiter ;

#All of the code for creating tables regarding account policies
create table Account_policies(
	Type_name varchar(20),
    balance_interest_rate decimal(6,5),
    daily_withdrawal_cap int,
    daily_deposit_cap decimal(9,2),
    bill_period int, #number of days?
    bill_interest_rate decimal(6,5),
    late_fee_rate decimal(6,5),
    max_miss_amount int,
    primary key (Type_name)
	);
    
create table Hold_causes(
	Type_name varchar(20),
    cause_desc varchar(50),
    primary key(Type_name,cause_desc),
    foreign key(Type_name) references Account_policies(Type_name)
    );
    

create table Accounts(
	Account_id char(36), #use same method trigger type for IDs as the user table?
    Type_name varchar(20),
    Balance decimal(9,2),
    date_started datetime,
    amount_deposited_today decimal(9,2),
    is_on_hold boolean,
    User_id char(36) not null,
    Card_num char(16), 
    Account_num char(9),
    primary key (Account_id),
    foreign key (User_id) references Users(User_id),
    foreign key (Type_name) references Account_policies(Type_name)
    unique key (Type_name,User_id)
    );

delimiter $$
create trigger account_start #trigger for preparing an incomplete account entry from the client side of the application
before insert on Accounts for each row
begin
	
	declare tempAccountID char(36);
	if new.Account_id is null then
		set @tempAccountID = uuid();
		
		while exists(select * from Accounts where Account_id = @tempAccountID) do
			set tempAccountID = uuid();
		end while;
			
		set new.Account_id = @tempAccountID;
	end if;
	set new.date_started = now();
    set new.amount_deposited_today = 0;
    set new.is_on_hold = false;
    
    if (select max(cast(Account_num as unsigned)) from Accounts) is null then
		set new.Account_num = '000000000';
    else
		set new.Account_num = (select lpad(cast((max(cast(Account_num as unsigned))+1) as char(9)),9,'0') from Accounts); #ultimately, autoincrement the 9 char id
	end if;
end;
$$
delimiter ;


delimiter $$
create trigger bill_for_credit	#every new credit account starts with a corresponding bill
after insert on Accounts for each row
begin
	if new.Type_name = 'credit' then
		insert into Bills(current_amount_owed,due_date,Account_id) values(new.Balance,now() + interval 3 minute,new.Account_id);
    end if;
end;
$$
delimiter ;

create table Transactions(
	Transaction_id char(36), #use trigger to make this automatically
    amount decimal(9,2),
    sender_account_id char(36) not null,
    receiver_account_id char(36) not null,
    date_time datetime,
    primary key(Transaction_id),
    foreign key(sender_account_id) references Accounts(Account_id),
    foreign key(receiver_account_id) references Accounts(Account_id)
    );


create table Bills(
	Bill_id char(36),
    current_amount_owed decimal(9,2),
    due_date datetime,
    current_miss_amount int,
    Account_id char(36) unique,
    Bill_num char(9),
    primary key(Bill_id),
    foreign key(Account_id) references Accounts(Account_id)
    );
    

   
delimiter $$
create trigger start_bill #trigger for preparing an incomplete bill entry from the client side of the application
before insert on Bills for each row
begin
	declare tempBillId char(36);
    if (select type_name from Accounts where Account_id = new.Account_id) != 'credit' then
		signal sqlstate '45000' set message_text = 'Bills can only be for credit accounts!';
    end if;
    
    if new.Bill_id is null then
		set tempBillId = uuid();
        while exists(select * from Bills where Bill_id = tempBillId) do
			set tempBillId = uuid();
		end while;
        set new.Bill_id = tempBillId;
    end if;
    
    set new.current_miss_amount = 0;
    if (select max(cast(Bill_num as unsigned)) from Bills) is null then
		set new.Bill_num = '000000000';
    else
		set new.Bill_num = (select lpad(cast((max(cast(Bill_num as unsigned))+1) as char(9)),9,'0') from Bills); #ultimately, autoincrement the 9 char id
	end if;
end;
$$
delimiter ;

create table payment_for_bill( #originally had a foreign key to bill, but we decided that bills should be removable from the database
								#though the record of payments for it should not be removed in such a case.
	Transaction_id char(36),
    Bill_id char(36),
    primary key (Transaction_id,Bill_id),
    foreign key(Transaction_id) references Transactions(Transaction_id)
    );


create table Bank_table(
	global_balance decimal(10,2),
    Account_id char(36),
    primary key(global_balance,Account_id),
    foreign key(Account_id) references Accounts(Account_id)
    );
    
delimiter $$
create trigger new_account_money #every time new money enters the datbase, it's added to this sum by this trigger
after insert on Accounts for each row
begin
	if new.Balance > 0 then
		update bank_table
        set global_balance = global_balance + new.Balance
        where Account_id = '000000000000000000000000000000000000';
	end if;
end;
$$
delimiter ;


#below are the insert statements neccessary on database fresh start
insert into Users values('000000000000000000000000000000000000','Bank','Bank','---------',null,null,null,null,'-',null);
insert into account_policies values('Unreal',0,0,0,0,0,0,1000);
insert into Accounts values('000000000000000000000000000000000000','Unreal',0,now(),0,false,'000000000000000000000000000000000000',null,'000000000');
insert into Bank_table values(0,'000000000000000000000000000000000000');


delimiter $$
create trigger exchanger # trigger for reflecting all incoming transactions, within the database
before insert on Transactions for each row
begin #should the available balance of the sender be checked on app side
	declare tempTranId char(36);
   
    
    if (select Type_name from Accounts where Account_id = new.sender_account_id) = 'credit' 
		or (select Type_name from Accounts where Account_id = new.sender_account_id) = 'credit' then
        
        signal sqlstate '45000' set message_text = 'No transfers involving a credit account are allowed';
	end if;
    
    if new.Transaction_id is null then
		set tempTranId = uuid();
        while exists(select * from transactions where Transaction_id = tempTranId) do
			set tempTranId = uuid();
		end while;
        set new.transaction_id = tempTranId;
    end if;
    
	if (select Balance from Accounts where Account_id = new.sender_account_id) < new.amount then #if there sender can't afford to make this transaction
		signal sqlstate '45000' set message_text = 'Insufficient balance';
        
    elseif new.receiver_account_id = '000000000000000000000000000000000000' then
		#if this is for a bill, adjustments to the bill tuple
        #and payment_for_bill needs an insert
        
        update Bills #reset miss amount on bill and pay bill
        set current_amount_owed = current_amount_owed - new.amount, current_miss_amount = 0
        where Account_id = (select Account_id from Accounts where Type_name ='credit' and User_id = (select User_id from Accounts where Account_id = new.sender_account_id));#new.sender_account_id;
        
        update Accounts #update credit balance to reflect bill
        set Balance = Balance - new.amount
        where Account_id = (select prox1.Account_id from (select * from Accounts) as prox1 where prox1.Type_name ='credit' and prox1.User_id =
			(select prox2.User_id from (select * from Accounts) as prox2 where prox2.Account_id = new.sender_account_id));
        
        update Accounts #take money from sender
        set Balance = Balance - new.amount 
        where Account_id = new.sender_account_id;
            
    elseif new.sender_account_id = '000000000000000000000000000000000000' then #deposity case - never implemented on client side
		update Accounts # deposit validation should be done on app side
        set Balance = Balance + new.amount, amount_deposited_today = amount_deposited_today + new.amount
        where Account_id = new.receiver_account_id;
        
        update bank_table
        set global_balance = global_balance + new.amount
        where Account_id = '000000000000000000000000000000000000';
        
    else # for a regular transaction between two user accounts
		update Accounts 
        set Balance = Balance - new.amount 
        where Account_id = new.sender_account_id;
        
        update Accounts
        set Balance = Balance + new.amount
        where Account_id = new.receiver_account_id;
    end if;
	set new.date_time = now();	
    
end;
$$
delimiter ;

delimiter $$
create trigger exchange_payment_log # this trigger leaves records for bill payments
after insert on transactions for each row
begin
    
	if new.receiver_account_id = '000000000000000000000000000000000000' then
		insert into payment_for_bill values(new.Transaction_id,
			(select Bill_id from Bills where Account_id = (select Account_id from Accounts where Type_name ='credit' and User_id = (select User_id from Accounts where Account_id = new.sender_account_id))));
    end if;
end;
$$
delimiter ;


delimiter $$
create event savings_interest_granter #event for savings accounts, but I believe I can make it work for other types too
on schedule every 1 day do
begin
	declare interRate decimal(6,5);
	
        
	select balance_interest_rate
	into interRate
	from account_policies
	where Type_name = 'savings';
		
	update Accounts 
	set Balance = Balance * ( 1 + interRate)
	where Type_name = 'savings';
end;
$$
delimiter ;

delimiter $$
create event daily_account_duties
on schedule every 1 day do
begin
	update accounts
    set amount_deposited_today = 0;
end;
$$
delimiter ;

select * from transactions where date_time > (now() - interval 1 month)

delimiter $$
create event bill_checker #event trigger for unpaid bills
on schedule every 1 minute do
begin
	declare currentTime datetime;
	set currentTime = now();
    
    delete from Bills
    where current_amount_owed <= 0;
    
    update Bills #This marks a miss for any account that has not finished its bill by the due date
    set current_miss_amount = current_miss_amount + 1, 
		due_date = currentTime + interval 5 minute,
        current_amount_owed = current_amount_owed * 
			(1+ (select bill_interest_rate from account_policies natural join accounts where Account_id = Bills.Account_id))
            + (select late_fee_rate from account_policies natural join accounts where Account_id = Bills.Account_id)
    where current_amount_owed > 0 and due_date <= currentTime and 
		(select is_on_hold from Accounts where Account_id = Bills.Account_id) = false;
    
    update Accounts #This sets accounts with too many misses to 'on hold'
    set is_on_hold = true #where the account has an overdue bill: CANNOT use table of question in 'where' clause, so i had to proxy it
    where is_on_hold = false and Account_id in (select prox.Account_id from (select * from Accounts) as prox,Bills,account_policies #careful of ambiguity
		where prox.Account_id = Bills.Account_id 
			and prox.Type_name = account_policies.Type_name
			and Bills.current_miss_amount >= account_policies.max_miss_amount);
	
    update Accounts
    set Balance = (select current_amount_owed from Bills where Account_id = Accounts.Account_id)
    where Type_name = 'credit';
end;
$$
delimiter ;


SET GLOBAL event_scheduler = ON;

insert into account_policies values('savings',1.5,100000,40000,0,0.2,0.5,3);
insert into account_policies values('checking',1.1,100000,40000,0,0.1,0.2,3);
insert into account_policies values('credit',1.1,100000,40000,0,0.1,0.2,3);
