import React, { Component } from 'react';
import {Container, Row, Col, Button, Form} from 'react-bootstrap';

class StarterOptions extends Component {
  constructor(props){
    super(props)
    this.goBack = this.goBack.bind(this)
  }
  goBack(){
    this.props.parent.setState({
      index: "Start"
    })
  }

  render(){
    return(
      <Row className="RightSide align-items-end">
      <Col>
        <Form action="/login/secret" method="post">
        <Form.Group controlId="formGroupEmail">
  <Form.Label>Email address</Form.Label>
  <Form.Control type="email" name="email" placeholder="Enter email" />
</Form.Group>
<Form.Group controlId="formGroupPassword">
  <Form.Label>Password</Form.Label>
  <Form.Control type="password" name="password" placeholder="Password" />
  <Form.Control type="hidden" name="isSignUp" value={false} />

</Form.Group>
<Button variant="outline-danger" onClick={this.goBack} >CANCEL</Button>

  <Button variant="outline-dark" type="submit" value="Log In">SUBMIT</Button>

        </Form>

        </Col>
      </Row>
    )
  }
}


export default StarterOptions
