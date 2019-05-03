
/*

alter table payment_for_bill drop foreign key payment_for_bill_ibfk_2

delimiter $$
create trigger exchange_payment_log
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
create trigger exchanger
before insert on Transactions for each row
begin #should the available balance of the sender be checked on app side
	declare tempTranId char(36);
    #TODO set condition for case of account being on hold?

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

        #Also probably on app side, it should check if a bill exists
        #for the account.
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

    elseif new.sender_account_id = '000000000000000000000000000000000000' then
		update Accounts # deposit validation should be done on app side
        set Balance = Balance + new.amount, amount_deposited_today = amount_deposited_today + new.amount
        where Account_id = new.receiver_account_id;

        update bank_table
        set global_balance = global_balance + new.amount
        where Account_id = '000000000000000000000000000000000000';

    else #the "else" if for a regular transaction
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

alter table Accounts add column Account_num char(9);
alter table Bills add column Bill_num char(9);

delimiter $$
create trigger account_start
before insert on Accounts for each row
begin
	#should i include attribute value validation?
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
create trigger bill_for_credit
after insert on Accounts for each row
begin
	if new.Type_name = 'credit' then
		insert into Bills(current_amount_owed,due_date,Account_id) values(new.Balance,now() + interval 30 minute,new.Account_id);
    end if;
end;
$$
delimiter ;

delimiter $$
create trigger start_bill
before insert on Bills for each row
begin
	declare tempBillId char(36);
	#should i include attribute value validation?
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


*/
