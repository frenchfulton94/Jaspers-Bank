import React, { Component } from 'react';
import {Col, Row, Button, Navbar, Nav, Container, Collapse} from 'react-bootstrap';
import CreateAccountModal from './createaccountmodal.js'
import Head from 'next/head';

class Header extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      open: false,
      createAccountOpen: false
    };
    this.openModal = this.openModal.bind(this)
  }

  openModal(event){
      this.setState({
        createAccountOpen: this.state.createAccountOpen ? false : true
      })
      console.log("modal")
      console.log(this.state)
  }
  render(){
    const { open } = this.state
    return (

      <Row>
      <Head>
      <link
      rel="stylesheet"
      href="https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
      integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
      crossOrigin="anonymous"
    />
      </Head>
              <Col xs={12}>
                <Navbar.Brand> <img src="/logo.svg" /></Navbar.Brand>
                <Button className="float-right" variant="outline-dark" onClick={() => this.setState({ open: !open})}><span className="navbar-toggler-icon"></span></Button>
              </Col>
              <Col xs={12} className="my-5">
                <Collapse in={this.state.open}>
                <div>
                  <Nav className="flex-column menu">
                    <Nav.Link className="menuOption align-items-center" onClick={this.openModal}>CREATE AN ACCOUNT</Nav.Link>
                    <Nav.Link className="menuOption" href="#">VIEW BILLS</Nav.Link>
                    <Nav.Link className="menuOption" href={`/records`}>VIEW RECORDS</Nav.Link>
                    <Nav.Link className="menuOption" href="#">ABOUT</Nav.Link>
                    <Nav.Link className="menuOption" href="/signout">SIGN OUT</Nav.Link>
                  </Nav>
                  </div>
                </Collapse>
                <CreateAccountModal parent={this} />
        </Col>
      </Row>
    )
  }
}

export default Header
