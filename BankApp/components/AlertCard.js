import React, { Component } from 'react';
import {Col, Row} from 'react-bootstrap';

class AlertCard extends Component {
  render(){
    return(
    <Row className = "alertCard text-center">
      <Col>
        <AlertTitle value="MISSED PAYMENTS!!!" />
        <AlertBody value={`You’ve missed (${this.props.value.current_miss_amount}) payment`}/>
      </Col>
    </Row>
  )
  }
}

class AlertTitle extends Component {
  render() {
    return (
        <>
          <p>{this.props.value}</p>
        </>

    )
  }
}

class AlertBody extends Component {
  render() {
    return(
      <>
          <p>{this.props.value}</p>
      </>
    )
  }
}

export default AlertCard
