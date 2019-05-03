import React, { Component } from 'react';
import {Col, Row, ButtonToolbar, Button} from 'react-bootstrap';
import AccountHeader from './accountheader.js';
import PayBillsModal from './paybillsmodal.js'

class BillCard extends Component {
  constructor(props){
    super(props)
    this.state = {
      showBillsModal: false
    }
    this.openBillsModal = this.openBillsModal.bind(this)
  }

  openBillsModal(){
    this.setState({
      showBillsModal: this.state.showBillsModal ? false : true
    })
  }

  closeModal(){
    this.setState({
      show: false
    })
  }
  render(){
    var accountNumber = this.props.value.Bill_num
    console.log(this.props.value)
    var accountEnding = accountNumber.substr(accountNumber.length - 4)
    return(
      <Row className="billCard">
        <Col>
          <AccountHeader type={this.props.value.Type_name} number={accountEnding} />
          <BillBody date={this.props.value.due_date} amount={this.props.value.current_amount_owed}/>
          <BillActions parent={this} />
        </Col>
        <PayBillsModal bill={this.props.value} parent={this} accounts={this.props.accounts} />
      </Row>
    )
  }
}
/*
    Bill_id char(36),
    current_amount_owed decimal(9,2),
    due_date datetime,
    current_miss_amount int,
    Account_id char(36) unique,
*/
class BillBody extends Component {

  createDateTime(dateTime){
    let dateTimeArray = dateTime.split("T")
    let dateArray = dateTimeArray[0].split('-')
    let year = dateArray[0]
    let month = dateArray[1]
    let day = dateArray[2]
    let dateString = month + "/" + day + "/" + year
    let time = dateTimeArray[1].substr(0, dateTimeArray[1].length-8);
    let finalString = dateString + " " + time
    return finalString
  }
  render(){
    return(
      <Row>
        <Col>
          <p>NEXT PAYMENT DUE BY: <strong>{this.createDateTime(this.props.date)}</strong></p>
          <p><strong>AMOUNT DUE: ${this.props.amount}</strong></p>
        </Col>
      </Row>
    )
  }
}

class BillActions extends Component {
  render(){
    return(
      <Row>
        <Col>
          <ButtonToolbar>
            <Col xs={4} className="ButtonCol">
              <Button variant="outline-dark" onClick={this.props.parent.openBillsModal}>PAY BILL</Button>
            </Col>

            <Col xs={4} className="ButtonCol">
              <Button variant="outline-dark">RECORDS</Button>
            </Col>
          </ButtonToolbar>
        </Col>
      </Row>
    )
  }
}

export default BillCard
