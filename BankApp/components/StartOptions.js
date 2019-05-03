import React, { Component } from 'react';
import {Container, Row, Col, Button , Image } from 'react-bootstrap';

class StartOptions extends Component {
  constructor(props){
    super(props)

    this.signUp = this.signUp.bind(this)
    this.login = this.login.bind(this)
  }

  changView(view) {
    this.props.parent.setState({
      index: view
    })
    console.log("ddfef")
  }

  signUp(){
    console.log("djdjdjdjdjd")
    this.changView("SignUp")
  }

  login(){
    this.changView("Login")
  }
  render(){

    return(
      <Row className="align-items-end RightSide">
      <Col>
        <div className="indexSQS mb-5">
          <p>SIMPLE.</p>
          <p>QUICK.</p>
          <p>SECURE.</p>
        </div>
        <Row>
        <Col>
          <Button className = "signupButton mb-5" variant="outline-dark" onClick={this.signUp}>signup</Button>

        </Col>
      </Row>
          <Row>
          <Col>
            <Button className = "loginButton" variant="outline-dark" onClick={this.login}>login</Button>

          </Col>
        </Row>
        </Col>
      </Row>
    )
  }
}

export default StartOptions
