import React, { Component } from 'react';
import {Col, Row, ButtonToolbar, Button} from 'react-bootstrap';
import AlertCard from './alertcard.js';
import AccountCard from './accountcard.js';
import BillCard from './billcard.js';

class DashboardSection extends Component {
  constructor(props) {
    super(props);
    console.log(props.parent)
    let trans

    this.state = {
      values: "",
      main: this.props.main
    }
    this.selectMainAccount = this.selectMainAccount.bind(this)
  }

  componentDidMount(){
    var values;
    if (this.props.values.length > 0) {
    values = this.props.values.map((item)=>

      this.returnCard(item)
    )
  } else {
    values = <NoValues type={this.props.title} />
  }

  this.setState({
    values: values
  })
  }

  selectMainAccount(event){
    var _this = this
    let selectedID = event.target.value
    console.log(selectedID)
    let url = `/User/${this.props.id}/secret`
    let res = fetch(url, {
        method: "post",
        body: JSON.stringify({Account_id: selectedID}),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(function(response){
      console.log(response.json())

      _this.setState({
         main: selectedID
      })
    })
    // let json = await res.json()
    // console.log(json)
    // this.setState({
    //   main: selectedID
    // })
  }

  returnCard(item){

    switch(this.props.title) {
      case 'Alerts':
          return <AlertCard value={item} />
      case 'Bills':
        return <BillCard value={item} accounts={this.props.accounts} />
      default:
      console.log("transactions")
      console.log(item)
      console.log(this.props.transactions[item.Account_id])
        return <AccountCard account={item}
          transactions={this.props.transactions[item.Account_id]}
          accounts={this.props.values} parent={this} main={this.state.main} />
    }
  }



  // getAccounts(){
  //   var id = this.props.id
  //   const res = await fetch(`https://9d170bae.ngrok.io/Accounts/${id}/secret`)
  //   const json = await res.json()
  //   console.log(json)
  // }
  render(){

    console.log("im being called")
    return(
      <>
      <DashboardSectionHeader sectionTitle={this.props.title} />

      <Row>
        <Col>
          {this.state.values}
        </Col>
      </Row>
      </>
    )
  }
}

class DashboardSectionHeader extends Component {
  render(){
    return(
      <Row className="DashboardSectionHeader">
        <Col>
          <p>{this.props.sectionTitle}</p>
        </Col>
      </Row>
    )
  }
}

class NoValues extends Component {
  render(){
    return(
      <Row className="text-center">
        <Col>
          <p>THERE ARE NO {this.props.type}</p>
        </Col>
      </Row>
    )
  }
}

export default DashboardSection
