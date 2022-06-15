import Container from 'react-bootstrap/Container';
import {Link} from 'react-router-dom';
import { Formik, Form,useField } from 'formik';
import * as Yup from 'yup';
import Button from 'react-bootstrap/Button';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import FormControl from 'react-bootstrap/FormControl';
import Row from 'react-bootstrap/Row';
import {errorStyles,linkstyles} from '../styles';
import React, { useState,useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Loader from './loadingPage';

var ls = require('local-storage');

const TextInput = ({label,...props})=>{
	const [field,meta] = useField(props);
	return(
		<FormGroup as={Row} className="mb-4">
			<FormLabel style={{fontWeight:'bold'}}htmlFor={props.id || props.name}>{label}</FormLabel>
			<FormControl className='p-2'{...field}{...props} />
			{meta.touched && meta.error ?(
				<div className="error text-wrap" style={errorStyles}>{"*"+meta.error}</div> 
				): null}
		</FormGroup>
		);
}

function SignUp(props) {
    const nav = useNavigate();
    const [iswaiting,setIswaiting] =useState(false);
    const [updateValue,setUpdateValue] = useState(0);
    useEffect(() => {
        function validate(){
            props.socket.emit('validateToken',ls('token'),(response)=>{
                if(response.success)
                {
                    nav("/dashboard");
                }
            });
        }
        validate();
      },[updateValue]);    

    const SignUpForm = (props)=>{
        return(
            <Formik
                initialValues={{
                    email:'',
                    phonenumber:'',
                    password:''
                }}
    
                validationSchema = {Yup.object({
                    email: Yup.string()
                        .email("Please enter a valid email address")
                        .required("Mandatory Field"),
                    phonenumber: Yup.string()
                        .matches(new RegExp('^[1-9][0-9]{9}$'),"Enter a valid Phone Number")
                        .required('Required',"Please enter your phone number"),
                    password: Yup.string()
                    .required('Please Enter your password')
                    .matches(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})"),
                    "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
                    )
                })}
                    onSubmit={(values,{setSubmitting})=>{
                        setTimeout(()=>{
                            setIswaiting(true);
                            props.socket.emit('signup',values,(response) =>{
                                if(response===true) {
                                    alert("User Registered");
                                }
                                else{
                                    alert(response);
                                }
                                setIswaiting(false);
                                nav("/");
                            });
                            setSubmitting(false);
                        },400);
                    }}
            >
                <Form>  
                    <TextInput
                        label="Email"
                        name="email"
                        id="email"
                        placeholder="Enter Your Email ID"
                        type="email"
                    />
                    <TextInput
                        label="Phone Number"
                        name="phonenumber"
                        id="phonenumber"
                        placeholder="Enter Your Phone Number"
                        type="text"
                        
                    />
                    <TextInput
                        label="Password"
                        name="password"
                        id="password"
                        placeholder="Enter Your Password"
                        type="password"
                    />
                    <div className="d-grid mt-5 col-6 mx-auto">
                        <Button variant="primary" size="lg" type="submit">Sign Up</Button>
                    </div>
                </Form> 
            </Formik>
        )
    }

    if(iswaiting)
    {
        return (<Loader />);
    }else{
        return (
            <Container className="d-flex vh-100 align-items-center justify-content-center p-3">
                <div className="d-flex flex-column col-lg-5 gap-4 align-items-center shadow p-5 mb-5 bg-white rounded ">
                    <h1>Sign Up</h1>
                    <SignUpForm socket={props.socket}/>
                    <Link to="/" className="d-grid text-right" style={linkstyles}>Already signed up?  Click here to login</Link>
                </div>
            </Container>
        );
    }
}

export default SignUp;