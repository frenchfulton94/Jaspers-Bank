import React, { Component } from 'react';
import {Row, Col, ButtonToolbar, Button} from 'react-bootstrap';
import AccountHeader from './accountheader.js';
import TransferModal from './transfermodal.js'
import Link from 'next/Link'
class AccountCard extends Component {
  constructor(props){
    super(props)

    this.state = {
      openTransfers: false,
      main: this.props.main,
      parent: this.props.parent,
      imageKey: this.getRandomInt(14) + 1
    }
    this.openModal = this.openModal.bind(this)
  }

  openModal(event) {
    console.log("Open Modal")
    this.setState({
      openTransfers: this.state.openTransfers ? false : true
    })

    console.log(this.state)
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  render(){
    var accountNumber = this.props.account.Account_num
    var accountEnding = accountNumber.substr(accountNumber.length - 4)

    return(
      <Row className='AccountCard' style={{ backgroundImage: `url(/static/${this.state.imageKey}.JPG)`}}>

          <AccountHeader type={this.props.account.Type_name} number={accountEnding}/>
          <AccountBalance amount={this.props.account.Balance} />
          <AccountRecords id={this.props.account.Account_id} transactions={this.props.transactions} />
          <AccountActions openModal={this.openModal} type={this.props.account.Type_name} id={this.props.account.Account_id} main={this.state.main} grandparent={this.state.parent} />
          <Col xs={12} className="filter">
          </Col>
        <TransferModal accounts={this.props.accounts}  account={this.props.account} parent={this} />
      </Row>
    )
  }
}


class AccountBalance extends Component {
  render(){
    return(
        <Col xs={12} className="AccountBalanceLabel">
          <p>${this.props.amount}</p>
        </Col>
    )
  }
}

class AccountRecords extends Component {

  createDateTime(dateTime){
    let dateTimeArray = dateTime.split("T")
    let dateArray = dateTimeArray[0].split('-')
    let time = dateTimeArray[1].substr(0, dateTimeArray[1].length-8);

    return time
  }

  createValue(transaction){
    console.log(transaction)
    console.log(this.props.id == transaction.reciever_account_id )
    return {
      time: this.createDateTime(transaction.date_time),
      recipient:  this.props.id == transaction.receiver_account_id ? transaction.sender_name : transaction.receiver_name ,
      amount: transaction.amount
    }
  }
  render(){
    // const account = this.props.
    var value;
    console.log(this.props)
    var records = this.props.transactions.map((transaction) =>
    <Record value = {this.createValue(transaction)} />
  )

    return(

        <Col xs={12} className="AccountCardRecords">
        {records}
        </Col>

    )
  }
}

class AccountActions extends Component {
  constructor(props){
    super(props)

    this.state = {
      main: this.props.main
    }
  }
  render(){
    console.log("ACCOUNTACTION")
    console.log(this.props.id)
        console.log(this.props.grandparent.state.main)
    return(

          <>
              <Col xs={4} className="ButtonCol">
                <Button variant="outline-dark" href={`/records?Account=${this.props.id}`}>RECORDS</Button>

              </Col>
              <Col xs={4} className="ButtonCol">

          {this.props.type == "credit" ?
        (<Button variant="outline-dark">PAY BILLS</Button>) :
        (<Button variant="outline-dark" onClick={this.props.openModal}>TRANSFER</Button>)
      }
      </Col>

        {(this.props.type != "credit" && this.props.id != this.state.main) &&
            <Col xs={4} className="ButtonCol">
        <Button variant="outline-dark" value={this.props.id} onClick={this.props.grandparent.selectMainAccount}>
        MAIN
        </Button>
      </Col>
      }

</>

    )
  }
}

class Record extends Component {
  render(){
    return(
      <Row className="CardRecord">
        <RecordTime value={this.props.value.time}/>
        <RecordRecipient value={this.props.value.recipient}/>
        <RecordAmount value={this.props.value.amount}/>
      </Row>
    )
  }
}

class RecordTime extends Component {
  render(){
    return(
      <Col className="RecordTimeLabel">
        <p>{this.props.value}</p>
      </Col>
    )
  }
}

class RecordRecipient extends Component {
  render(){
    return(
      <Col className="RecordRecipientLabel">
        <p>{this.props.value}</p>
      </Col>
    )
  }
}

class RecordAmount extends Component {
  render(){
    return(
      <Col className="RecordAmount text-right">
        <p>${this.props.value}</p>
      </Col>
    )
  }
}



export default AccountCard
