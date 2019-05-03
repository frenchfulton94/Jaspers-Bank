import React, { Component } from 'react';
import {Container, Row, Col, Button, Form} from 'react-bootstrap';
import {withRouter} from 'next/router';

class SignUp extends Component {
  constructor(props){
    super(props);
    this.state = {
      index: 0,
      accountType: "checking"

    }
    this.updateValues = this.updateValues.bind(this)

  }


  updateValues(event){
    var name = event.target.name
    var value = event.target.value
    console.log(name)
    console.log(value)
    this.setState({
      [name]: value
    })
    console.log(this.state)
  }

  returnForm(){
    let accountSelectioForm = <AccountSelectionForm
    grandParent={this.props.parent}
    parent={this}
    accountType={this.state.accountType}
      />

      let personalInfoForm = <PersonalInfoForm
        parent={this}
        onChange={this.updateValues}
        user={this.state}
        />

        let loginCredentialsForm = <LoginCredentialsForm
        email={this.state.email}
        password={this.state.password}
        parent={this}
        onChange={this.updateValues}

        />

    switch(this.state.index){
      case 1:
      return personalInfoForm
      case 2:
      return loginCredentialsForm
      default:
      return accountSelectioForm
    }
  }
  render(){


    return(
      <Row className="RightSide align-items-end ">
        <Col>
          {this.returnForm()}
        </Col>
      </Row>
    )
  }
}



class LoginCredentialsForm extends Component {
  constructor(props){
    super(props)
    this.state = {
      validated: false,
      isValidEmail: false,
      isInValidEmail: false,
      emailFeedback: ""
    }
    this.goBack = this.goBack.bind(this)
    this.handleSubmission = this.handleSubmission.bind(this)
  }
  goBack(){
    this.props.parent.setState({
      index: 1
    })
  }
  handleSubmission(event){
    console.log(event.currentTarget)
    console.log(event.target)
    console.log(this.state.isValidEmail)
if (!this.state.isValidEmail){
  console.log("Word")
  event.preventDefault();
  event.stopPropagation();

  var _this = this

  let res = fetch(`https://9d170bae.ngrok.io/User/emailExists/${this.props.email}/secret`).then(function(res){
    console.log(res)
    let json = res.json()
    console.log(res)
    console.log(json)
    json.then(function(js) {
      if (!js.isValid) {
      //{"Email is taken":false} //the email is good
        // {isValid: false, message: "This email already exists"}

      _this.setState({
        isInValidEmail: true,
        messgae: js.message,
        isValidEmail: false
      })
    } else {
      _this.setState({
        isInValidEmail: false,
        isValidEmail: true
      })
    }
    })




  })

}

  }


  render(){
    console.log('login')
    console.log(this.props.parent.state)

    return(
      <Row>
        <Col>
        <Form validated={this.state.validated} action='/login/secret' method="post" onSubmit={this.handleSubmission} >
          <Form.Group controlId="formGroupEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control required isValid={this.state.isValidEmail} isInvalid={this.state.isInValidEmail} type="email" name="email" value={this.props.email} onChange={this.props.onChange} placeholder="" />
            <Form.Control.Feedback>{this.state.emailFeedback}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="formGroupPassword">
            <Form.Label>PASSWORD</Form.Label>
            <Form.Control type="password" name="password" value={this.props.password} onChange={this.props.onChange} placeholder="" />
            <Form.Control type="hidden" name="firstName" value={this.props.parent.state.firstName} />
            <Form.Control type="hidden" name="lastName" value={this.props.parent.state.lastName} />
            <Form.Control type="hidden" name="address" value={this.props.parent.state.address} />
            <Form.Control type="hidden" name="phone" value={this.props.parent.state.phone} />
            <Form.Control type="hidden" name="ssn" value={this.props.parent.state.ssn} />
            <Form.Control type="hidden" name="accountType" value={this.props.parent.state.accountType} />
            <Form.Control type="hidden" name="isSignUp" value={true} />
          </Form.Group>
          < Button variant="outline-danger" onClick={this.goBack} >Back</Button>
            <Button variant="outline-dark" type="submit">SUBMIT</Button>
        </Form>
        </Col>
      </Row>

    )
  }

}

class PersonalInfoForm extends Component {
  constructor(props){
    super(props)
    this.state={
      validated: false
    }
    this.goBack = this.goBack.bind(this)
    this.next = this.next.bind(this)
  }
  goBack(){
    this.props.parent.setState({
      index: 0
    })
  }
  next(){
    console.log("im next")
    this.props.parent.setState({
      index: 2
    })
  }

  render(){
    return(
      <Row>
        <Col>
          <Form validated={this.state.valid} >
          <Form.Group controlId="formGridFirstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control name="firstName" value={this.props.user.firstName} onChange={this.props.onChange} placeholder="" />
          </Form.Group>
          <Form.Group controlId="formGridLastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control name="lastName" value={this.props.user.lastName} onChange={this.props.onChange} placeholder="" />
          </Form.Group>
          <Form.Group controlId="formGridAddress" >
            <Form.Label>Address</Form.Label>
            <Form.Control name="address" value={this.props.user.address} onChange={this.props.onChange} placeholder="" />
          </Form.Group>
          <Form.Group>
            <Form.Label controlId="formGridPhoneNumber">Phone Number</Form.Label>
            <Form.Control name="phone" value={this.props.user.phone} onChange={this.props.onChange} placeholder="" />
          </Form.Group>
          <Form.Group>
            <Form.Label controlId="formGridSSN">SSN</Form.Label>
            <Form.Control name="ssn" value={this.props.user.ssn} onChange={this.props.onChange} placeholder="" />
          </Form.Group>
          <Button variant="outline-danger" onClick={this.goBack} >Back</Button>

          <Button variant="outline-dark" onClick={this.next} >NEXT</Button>
          </Form>
        </Col>
      </Row>

    )
  }
}



class AccountSelectionForm extends Component {
  constructor(props){
    super(props)
    this.goBack = this.goBack.bind(this)
    this.next = this.next.bind(this)
  }
  goBack(){
    this.props.grandParent.setState({
      index: "Start"
    })
  }
  next(){
    this.props.parent.setState({
      index: 1
    })
  }
  render(){
    return(
      <Row>
        <Col>
        <Form>
        <Form.Group controlId="exampleForm">
    <Form.Label>What type of account would you like to open today?</Form.Label>
    <Form.Control as="select" name="accountType" value={this.props.parent.state.accountType}
      onChange={this.props.parent.updateValues}>
      <option default value="checking">Checkings</option>
      <option value="savings">Savings</option>
    </Form.Control>
  </Form.Group>
    <Button variant="outline-danger" onClick={this.goBack} >Back</Button>
  <Button variant="outline-dark" onClick={this.next} >NEXT</Button>

        </Form>
        </Col>
      </Row>

    )
  }
}



export default withRouter(SignUp)

/*
- Account Type
- name
- Address
- Phone Number
- SSN
- login LoginCredentials

*/
