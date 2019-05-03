import React, {Component} from 'react'
import {Container, Row, Col, Table, Button, Form,Image} from 'react-bootstrap'
import Header from '../components/header.js'
import fetch from 'isomorphic-unfetch'
import {withRouter} from 'next/router'
import "../style.scss"

class Records extends Component {

  static async getInitialProps({req}){

    var preHandle = function(event, ids, json,sender){
      let id = event.target.value
      var transactions;
      var isValid = function(){
      var accountIDs = ids.map((account) => account.Account_id )
      return accountIDs.includes(sender)
      }

      return json.filter((transaction) => (isValid() ? transaction.sender_account_id : transaction.receiver_account_id) == sender )
    }
    const id = req.user.User_id
    const account = req.query.Account
    console.log(req.query)
    var res = await fetch(`https://9d170bae.ngrok.io/Transactions/Mixed/${id}/0/secret`)

    const json = await res.json()

    res = await fetch(`https://9d170bae.ngrok.io/Accounts/ids/${id}/secret`)

    const accountsJson = await res.json()
    console.log("accountjson")
    console.log(accountsJson)
    var filteredjson;
    if (account != undefined){
          const event = {
        target: {value: account}
          }
        filteredjson = preHandle(event, accountsJson, json, account)
        }


    return {transactions: json, ids: accountsJson, selectedAccount: account, filteredTransactions: filteredjson}
  }

  constructor(props){
    super(props)

    this.state = {
      selectAccount: this.props.selectedAccount != undefined ? this.props.selectedAccount : "All",
      transactions: this.props.transactions,
      filteredTransactions: this.props.filteredTransactions != undefined ? this.props.filteredTransactions : this.props.transactions,
      ids: this.props.ids
    }

    this.handleSelection = this.handleSelection.bind(this)
  }



  handleSelection(event){
    let id = event.target.value
    var transactions;
    var isValid = function(props, sender){
    var accountIDs = props.ids.map((account) => account.Account_id )
    return accountIDs.includes(sender)
    }

    if (id != "All") {
      transactions = this.state.transactions.filter((transaction) =>
      (isValid(this.state, transaction.sender_account_id) ?
      transaction.sender_account_id : transaction.receiver_account_id) == id
    )
    } else {
      transactions  = this.state.transactions
    }
    this.setState({
      selectAccount: id,
      filteredTransactions: transactions
    })
  }

  render(){
    return(
      <Container>
      <Header />
        <Row>
          <Col>
            <FilterRecords accounts={this.props.ids} parent={this} />
          </Col>
          <Col>
            <TransactionsTable parent={this} ids={this.props.ids} />
          </Col>
        </Row>
      </Container>
    )
  }
}

class FilterRecords extends Component {
  render(){
    var accountEnding;
    return(
      <Form>
        <Form.Group>
          <Form.Control as ="select" name="selectAccount" value={this.props.parent.state.selectAccount} onChange={this.props.parent.handleSelection}>
            <option value="All">All Accounts</option>
            {this.props.accounts.map(function(account) {
              accountEnding = account.Account_num.substr(account.Account_num.length - 4)
                return(<option value={account.Account_id}>{account.Type_name} - ending in #...{accountEnding}</option>)
            }) }
          </Form.Control>
        </Form.Group>
      </Form>
    )
  }
}

class TableHeader extends Component {
  render(){
    return(
      <th>
        <Button>
        <p>{this.props.title}</p>
        <Image />
        </Button>
      </th>
    )
  }
}

class TableRow extends Component {
  //amount, sender_account_id, receiver_account_id, date_time,sender_name,receiver_name

  isValid(){
  var ids = this.props.ids.map((account) => account.Account_id)
  return ids.includes(this.props.transaction.sender_account_id)
  }

  getAccountNum(id){
    return this.props.ids.map(function(account){
      if (account.Account_id == id) {
        return account.Account_num
      }
    })
  }
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
      <tr>
        <td>{this.createDateTime(this.props.transaction.date_time)} </td>
        <td>${this.props.transaction.amount} </td>
        <td>{this.getAccountNum(this.isValid(this.props) ?
          this.props.transaction.sender_account_id :
          this.props.transaction.receiver_account_id) } </td>
        <td>{this.props.transaction.sender_name} </td>
        <td>{this.props.transaction.receiver_name} </td>
      </tr>
    )
  }
}

class NoTransactions extends Component{
  render(){
    return(
      <tr>
        <td colSpan="5">There are NO TRANSACTIONS for this Account.</td>
      </tr>
    )
  }
}

class TransactionsTable extends Component {

  render(){
    var rows = this.props.parent.state.filteredTransactions.map((transaction) => <TableRow transaction={transaction} ids={this.props.ids} />)
    if (rows.length == 0) {
      rows = <NoTransactions />
      }
    return(
      <Table striped bordered hover >
        <thead>
          <tr>
            <TableHeader title="Date" />
            <TableHeader title="Amount" />
            <TableHeader title="Account" />
            <TableHeader title="Sender" />
            <TableHeader title="Receiver" />
          </tr>
        </thead>
        <tbody>
            {rows}
        </tbody>
      </Table>
    )
  }
}
//    '/Transactions/Mixed/:User_id/:rowAmount/:api_key'
//    '/Accounts/ids/:User_id/:api_key'
export default withRouter(Records)
