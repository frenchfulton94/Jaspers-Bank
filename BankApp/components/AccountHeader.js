import React, { Component } from 'react';
import {Col, Row} from 'react-bootstrap';

class AccountHeader extends Component {
  render(){
    return(
        <Col className="AccountHeader">
          <p>{this.props.type} <span className="float-right">#...{this.props.number}</span></p>
        </Col>
    )
  }
}

export default AccountHeader
