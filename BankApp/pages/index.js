import Link from 'next/link';
import React, { Component } from 'react';
import {Container, Row, Col, Image} from 'react-bootstrap';
import Header from '../components/header.js';
import StartOptions from '../components/startoptions.js'
import Login from '../components/login.js'
import SignUp from '../components/signup.js'
import { withRouter } from 'next/router'
import "../style.scss"

class Index extends Component {
  constructor(props){
    super(props)
    // console.log(props)
    this.state = {
      index: "Start",
      forms: {

      "Start" : <StartOptions parent = {this}/>,
      "Login" : <Login parent = {this}/>,
      "SignUp" : <SignUp parent = {this} />
    }
  }

  // this.changeView = this.changeView.bind(this);
}


  render(){
    return(

      <Container className="py-5">
        <link
      rel="stylesheet"
      href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
      integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
      crossOrigin="anonymous"
    />
  <Row className="inner">
          <Col>
            <Image fluid className="float-right" src="/static/esb.png" />

          </Col>
          <Col className = "IndexRight">
            {this.state.forms[this.state.index]}
          </Col>
        </Row>
      </Container>
    )
  }
}


export default withRouter(Index)
