import React, { Component } from 'react';
import {Col, Row} from 'react-bootstrap';

class DashCard extends React.Component {
  constuctor(props){
    super(props);
  }

  render(){

    return(
    <Row>
      <Col>

      </Col>
    <Row/>
  );
  }
}

class Header extends React.Component {
  render() {
    return(
    <Row>
      <Col>
        <p>{this.props.type}</p>
        <p>{this.props.account}</p>
      </Col>
      <Col>
        <p>{this.props.balance}</p>
      <Col/>
    </Row>
  );
  }
}


class Body extends React.Component {
  render() {
    <Row>
      <Col>

      </Col>
    </Row>
  }
}
export default DashCard
