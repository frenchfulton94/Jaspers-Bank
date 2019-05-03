import React, { Component } from 'react';
import { Row, Col, Form, Modal, Button, InputGroup } from 'react-bootstrap';

class PayBillsModal extends Component {

  constructor(props){
    super(props)

    this.state = {
      senderAccount: this.props.accounts[0].Account_id
    }

    this.selectAccount = this.selectAccount.bind(this)
  }
  selectAccount(event){
    let id = event.target.value
    this.setState({
      senderAccount: id
    })
  }
  render(){
      console.log("bill")
      console.log(this.props.bill)
        var accountEnding;
    return(

      <Modal show={this.props.parent.state.showBillsModal} onHide={this.props.parent.openBillsModal}>
        <Modal.Header>
          <Modal.Title>Pay Bill</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="PayBillForm" action="/Transactions/Bill/secret" method="post">
            <Form.Group>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>BILL #</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control type="text"  name="BillNumber" value={this.props.bill.Bill_num} readOnly />
              </InputGroup>
            </Form.Group>
            <Form.Group>
              <InputGroup>
                <InputGroup.Prepend>
                <InputGroup.Text>Bill Account #</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control type="text" hidden disabled value={this.props.bill.Account_num} readOnly />

                <Form.Control type="text" hidden  name="bill_account_id" value={this.props.bill.Account_id} readOnly />
              </InputGroup>
            </Form.Group>
            <Form.Group>
              <InputGroup>
                <InputGroup.Prepend>
                <InputGroup.Text>$</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control type="text"
                  value={String(this.props.bill.current_amount_owed).split(".")[0]} readOnly disabled/>
                <Form.Control type="text" name="amount" hidden value={this.props.bill.current_amount_owed} readOnly />
                <InputGroup.Append>
                <InputGroup.Text>.{String(this.props.bill.current_amount_owed).split('.').length > 1 ? String(this.props.bill.current_amount_owed).split('.')[1] : "00" }</InputGroup.Text>
                </InputGroup.Append>
              </InputGroup>
            </Form.Group>
            <Form.Group>
              <Form.Label>PAYMENT DUE BY: {this.props.bill.due_date}</Form.Label>
            </Form.Group>
            <Form.Group>
              <Form.Label>PAY WITH:</Form.Label>
              <Form.Control as="select" name="sender_account_id" value={this.state.senderAccount} onChange={this.selectAccount}>
                {

                  this.props.accounts.map(function(account){
                  if (account.Type_name != "credit"){
                    accountEnding = account.Account_num.substr(account.Account_num.length - 4)
                  return(<option value={account.Account_id}>{account.Type_name } - ending in #...{accountEnding}</option>)
                }

              })}
            </Form.Control>
            </Form.Group>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-danger" onClick={this.props.parent.openBillsModal} >CANCEL</Button>
          <Button variant="outline-dark"  form="PayBillForm" type="submit" value="submit" >PAY</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

export default PayBillsModal
/*
 '/Transactions/Bill/:api_key'

 >> sender_account_id, amount

  */
