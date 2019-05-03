import React, { Component } from 'react'
import {Modal, Button, Form, InputGroup} from 'react-bootstrap'

class TransferModal extends Component {
  constructor(props){
    super(props)
    this.state = {
      email: "",
      amount: 0,
      route: "/TransactionsOther/secret",
      choice: "otherTransfer",
      recipient: "",
      show: false,
      account: "",
      formCheck: true
    }

    this.updateEmail = this.updateEmail.bind(this)
    this.updateAmount = this.updateAmount.bind(this)
    this.updateRoute = this.updateRoute.bind(this)
    this.updateAccount = this.updateAccount.bind(this)
    //this.handleClose = this.handleClose.bind(this)
  }

  updateEmail(event){
    let email = event.target.value
    this.setState({
      email: email
    })
  }

  updateAmount(event){
    let amount = event.target.value
    this.setState({
      amount: amount
    })
  }

  updateRoute(event){
    let route = event.target.value
    let name = event.target.name
    this.setState({
      route: route,
      choice: name
    })
   }
    updateAccount(event){
      let account = event.target.value
      this.setState({
        account: account
      })
    }

    getAccounts(accounts, account_id){
      var accountEnding;
    var options =  accounts.map(function(account){
    if (account_id != account.Account_id && account.Type_name != "credit") {
      accountEnding = account.Account_num.substr(account.Account_num.length - 4)
      return <option value={account.Account_id}>{account.Type_name} - ending in #...{accountEnding}</option>
    }
  })
      return options
    }

    handleClose(){
      this.setState({
        show: false
      })
    }


  render(){
    const type = this.props.account.Type_name
    return(
      <Modal show={this.props.parent.state.openTransfers} onHide={this.props.parent.openModal}>
        <Modal.Header>
          <Modal.Title>TRANSFER</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form id="transferForm" action={this.state.route} method="post">
            <Form.Group>
              <Form.Label>From:</Form.Label>
                <InputGroup>
                <InputGroup.Prepend>
                <InputGroup.Text id="inputGroupPrepend">{type}</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control type="text" disabled readOnly value={this.props.account.Account_num} />

              <Form.Control type="text" hidden readOnly value={this.props.account.Account_id} name="sender_account_id" />
              </InputGroup>
            </Form.Group>
            <Form.Group>
              <Form.Label>SELECT WHERE TO TRANSFER</Form.Label>
              <Form.Check
                disabled={!(this.props.accounts.length > 1) }
                onChange={this.updateRoute}
                checked={this.state.choice == "selfTransfer"}
                type="radio"
                label="My Accounts"
                name="selfTransfer"
                value="/Transactions/secret" />
              <Form.Check
                checked={this.state.choice == "otherTransfer" || !(this.props.accounts.length > 1)}
                onChange={this.updateRoute}
                type="radio"
                label="Another User"
                name="otherTransfer"
                value="/TransactionsOther/secret" />
            </Form.Group>
            { this.state.choice == "selfTransfer" && this.props.accounts.length > 0  ?
            (<Form.Group>
              <Form.Label>SELECT AN ACCOUNT</Form.Label>
              <Form.Control as="select" name="receiver_account_id" value={this.state.account} onChange={this.updateAccount}>
                  {this.getAccounts(this.props.accounts, this.props.account.Account_id)}
              </Form.Control>
            </Form.Group>) :
            (<Form.Group>
              <Form.Label>TO:</Form.Label>
              <Form.Control type="email" name="email"  value={this.state.email} onChange={this.updateEmail}/>
            </Form.Group>)}
            <Form.Group>
              <Form.Label>Amount:</Form.Label>
              <InputGroup>
              <InputGroup.Prepend>
              <InputGroup.Text id="inputGroupPrepend">$</InputGroup.Text>
              </InputGroup.Prepend>
                <Form.Control type="text" name="amount" value={this.state.amount} onChange={this.updateAmount}/>
              </InputGroup>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
        <Button variant="outline-danger" onClick={this.props.parent.openModal} >CANCEL</Button>
      <Button variant="outline-dark"  form="transferForm" type="submit" value="submit" >SEND</Button>
        </Modal.Footer>

      </Modal>
    )
  }
}

// '/Transactions/:api_key'  //  << Tranfers between your own accounts. Body args are amount, sender_account_id, receiver_account_id
// '/Transactions/:email/:api_key' //  <<Transfer to a different user. Body args are amount, sender_account_id, email
export default TransferModal
