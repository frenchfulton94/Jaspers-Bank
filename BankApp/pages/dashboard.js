import React, { Component } from 'react';
import {Col, Row, ButtonToolbar, Button, Container} from 'react-bootstrap';
import Link from 'next/link';
import Header from '../components/header.js';
import DashboardSection from '../components/dashboardsection.js'
import {withRouter} from 'next/router'
import "../style.scss"


class Dashboard extends Component{


  static async getInitialProps({req}){
      // console.log("dashboard")
      // console.log(req)
      var id = req.user.User_id
      // console.log(id)
      var res = await fetch(`https://9d170bae.ngrok.io/Accounts/${id}/secret`)

      const accountsJson = await res.json()
  console.log(accountsJson)


      res = await fetch(`https://9d170bae.ngrok.io/Transactions/All/${id}/5/secret`)

      const transJson = await res.json()


      res = await fetch(`https://9d170bae.ngrok.io/Bills/${id}/secret`)

      const billsJson = await res.json()
      console.log('bills')
      console.log(billsJson)

      res = await fetch(`https://9d170bae.ngrok.io/User/${id}/secret`)
      const json = await res.json()

      res = await fetch(`https://9d170bae.ngrok.io/Bills/misses/${id}/secret`)

      const alerts = await res.json()
      console.log("mainAccount")
      console.log(json.main_account_id)
      // '/Transactions/All/:User_id/:rowAmount/:api_key'

      return {accounts: accountsJson, transactions: transJson, bills: billsJson, name: req.user.First_name, main: json.main_account_id, id: id, alerts: alerts}
  }


constructor(props){
  super(props)
  // console.log("props")
  // console.log(this.props)
  this.state = {
    id: this.props.router.query.id,
    accounts: this.props.accounts,
    transactions: this.props.transactions,
    alerts: this.props.alerts,
    bills:this.props.bills

  }
}
//
// static async getData(){
//   var id = this.props.router
//
//   const res = await fetch(`https://9d170bae.ngrok.io/Accounts/${id}/secret`)
//   const json = await res.json()
//   this.setState({test: json})
//   console.log(json)
// }
//
//   componentDidMount(){
//
//       getData()
//   }


  render(){
    // console.log("state")
    // console.log(this.state)
    return (

      <Container className="py-5">
        <Header />
        <Row>
          <Col>
            <WelcomeMessage name={this.props.name} />

              <DashboardSection title="Alerts" values={this.state.alerts}/>


            <DashboardSection title="Accounts" values={this.state.accounts} transactions={this.state.transactions} main={this.props.main} id={this.props.id} />


            <DashboardSection title="Bills" values={this.state.bills}
              accounts={this.state.accounts}/>

          </Col>
        </Row>
      </Container>
    )
  }
}


class WelcomeMessage extends Component {

  render(){
    return (
      <Row className="greetingRow">
        <Col>
        <p className="greetingBlock">Welcome, {this.props.name} </p>
        </Col>
      </Row>
    )
  }
}


export default withRouter(Dashboard)
