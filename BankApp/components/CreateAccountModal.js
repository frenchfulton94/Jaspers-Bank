import React, {Component} from 'react';
import {Row, Col, Modal, Form, Button} from 'react-bootstrap';
import fetch from 'isomorphic-unfetch';

class CreateAccountModal extends Component {

  constructor(props){
    super(props)
    this.state = {
      accountType: "checking",
      initialAmount: 5,
      hasDuplicate: false
    }

    this.changeAmount = this.changeAmount.bind(this)
    this.changeAccount = this.changeAccount.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleSubmission = this.handleSubmission.bind(this)
  }

  changeAmount(event){
    this.setState({initialAmount: event.target.value})
  }

  changeAccount(event){
    this.setState({accountType: event.target.value})
  }

  handleClose(event){
    this.setState({show:false})
  }

  handleSubmission(event){
    event.preventDefault()
    event.stopPropagation()
    console.log(event)
    // fetch(`https://9d170bae.ngrok.io/CreateAccount/secret`,
    //   {
    //         method: "post",
    //         body: JSON.stringify({}),
    //         headers: {
    //             "Content-Type": "application/json"
    // })
    // if (this.state.hasDuplicate){
    //
    // } else {
    //
    // }


  }

  render(){

    return(
      <Modal show={this.props.parent.state.createAccountOpen} onHide={this.props.parent.openModal}>
        <Modal.Header>
          <Modal.Title>CREATE AN ACCOUNT</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="accountForm" action="/CreateAccount/secret" method="post" onSubmission={this.handleSubmission}>
          <Form.Group controlId="exampleForm">
      <Form.Label>What type of account would you like to open today?</Form.Label>
      <Form.Control as="select" name="accountType" value={this.state.accountType} onChange={this.changeAccount}>
        <option default value="checking">Checkings</option>
        <option value="savings">Savings</option>
        <option value="credit">Credit</option>
      </Form.Control>
    </Form.Group>
            <Form.Group>
              <Form.Label>How much money would you like to start with?</Form.Label>
              <Form.Control as="select" name="initialAmount" value={this.state.initialAmount} onChange={this.changeAmount}>
                <option default value={5}>$5</option>
                <option value={50}>$50</option>
                <option value={500}>$500</option>
              </Form.Control>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
        <Button variant="outline-danger" onClick={this.props.parent.openModal} >CANCEL</Button>
      <Button variant="outline-dark"  form="accountForm" type="submit" value="submit" >CREATE</Button>
        </Modal.Footer>
      </Modal>
    )
  }
}

export default CreateAccountModal
