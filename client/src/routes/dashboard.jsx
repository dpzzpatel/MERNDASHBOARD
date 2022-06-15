import React, { useEffect , useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Formik, Form,useField } from 'formik';
import * as Yup from 'yup';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Table from 'react-bootstrap/Table';
import {FiEdit} from 'react-icons/fi';
import {BsFillTrashFill} from 'react-icons/bs';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import {errorStyles,linkstyles} from '../styles';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import FormLabel from 'react-bootstrap/FormLabel';
import FormControl from 'react-bootstrap/FormControl';
import FormSelect from 'react-bootstrap/FormSelect';
import Loader from './loadingPage';

var ls = require('local-storage');
let states = [ "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu and Kashmir","Jharkhand","Karnataka",
"Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Sikkim","Tamil Nadu","Telangana","Tripura","Uttarakhand","Uttar Pradesh",
"West Bengal","Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli","Daman and Diu","Delhi","Lakshadweep","Puducherry"]



function DashBoard(props){
    const nav = useNavigate();
    const [candidatesdata, setCandidatesData] = useState([]);
    const [updateValue,setUpdateValue] = useState(0);
    const [iswaiting,setIswaiting] =useState(false);
    const [iseditable,setisEditable] = useState(false);
    const [editid,setEditid] = useState(0);

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);


    

    const TextInput = ({label,...props})=>{
        const [field,meta] = useField(props);
        return(
                <Col>
                    <FormLabel style={{fontWeight:'bold'}}htmlFor={props.id || props.name}>{label}</FormLabel>
                    <FormControl className='p-2'{...field}{...props} />
                        {meta.touched && meta.error ?(
                        <div className="error text-wrap" style={errorStyles}>{"*"+meta.error}</div> 
                        ): null}
                </Col>
            );
    }


    const SelectInput = ({label,...props})=>{
        const [field,meta] = useField(props);
        return(
                <Col>
                    <FormLabel style={{fontWeight:'bold'}}htmlFor={props.id || props.name}>{label}</FormLabel>
                        <FormSelect {...field} {...props} aria-label="Default select example" />
                        {meta.touched && meta.error ?(
                        <div className="error text-wrap" style={errorStyles}>{"*"+meta.error}</div> 
                        ): null}
                </Col>
            );
    }
    const deletecandidate = (e,id)=>{
        if (window.confirm("Are you sure you want to delete?") === true){
          
            setIswaiting(true);
            props.socket.emit('deletecandidate',id,response=>{
                if(response)
                    setUpdateValue(updateValue+1);
            })
        }
    }
    const editcandidate = (e,id)=>{
        setEditid(id);
        setisEditable(true);
        handleShow();
    }
    useEffect(()=>{
        setIswaiting(true);
        props.socket.emit('validateToken',ls('token'),async (response)=>{
            if(response.success ===false)
                nav("/");
            else{
                props.socket.emit('getcandidateslist',(response)=>{
                    setCandidatesData(response,[]);
                    setIswaiting(false);
                });
            }
        });
    },[updateValue]);

    const getinitialValues = ()=>{
        if(iseditable){
            let obj = candidatesdata.find(o=>o._id === editid);
            return {
                name: obj.name,
                address: obj.address,
                dob: obj.dob,
                state: obj.state,
                age: obj.age,
                email: obj.email
            }
        }else{
            return{
                name: "",
                address: "",
                dob:  "",
                state: "",
                age: "",
                email: ""
            }
        }
    }

   

    const checkHandleClose = ()=>{
        if(iseditable){
            setisEditable(false);
            setEditid("");
            handleClose();
        }else{
            handleClose();
        }
    }
    const handleSelectionChange = (e,id)=>{
        if(window.confirm("Are you sure you want to make changes in candidate result?")){
            setIswaiting(true);
            props.socket.emit('changeresult',e.target.value,id,(response)=>{
                if(response){
                    setIswaiting(false);
                    setUpdateValue(updateValue+1);
                }
            })
        }
    }

    const TableData = () => {
        return candidatesdata.map((candidatedetails,index)=>{
            let {_id,name,dob,email,result} = candidatedetails;
            return(
                <tr key={_id}>
                    <th scope="row">{index}</th>
                    <td>{name}</td>
                    <td>{dob}</td>
                    <td>{email}</td>
                    <td><select onChange={(e)=>handleSelectionChange(e,_id)}>
                            <option defaultValue value={result}>{result}</option>
                            <option value={result==="Rejected"?"shortlisted":"Rejected"}>{result==="Rejected"?"shortlisted":"Rejected"}</option>
                        </select>
                    </td>
                    <td style={{cursor: 'pointer'}}
                        >
                            <FiEdit onClick={(e) =>editcandidate(e,_id)}/> &nbsp; &nbsp;
                    <BsFillTrashFill onClick={(e) =>deletecandidate(e,_id)}/>
                    </td>
                </tr>
            )
        });
    }
    const handleLogout = ()=>{
        ls("token","");
        setUpdateValue(updateValue+1);
    }


    if(iswaiting)
        return (<Loader />)
    else
        return(
        <>
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Container>
                <Navbar.Brand href="#home"><h2>Dashboard</h2></Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="ml-auto">
                    <Nav.Link onClick={()=>handleLogout()}>
                        Logout
                    </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container>
                <h3> List of Candidates : {candidatesdata.length}</h3>
                <Table responsive striped className="">
                        <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Name</th>
                            <th scope="col">Date of Birth</th>
                            <th scope="col">Email</th>
                            <th scope="col">Result</th>
                            <th scope="col">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {TableData()}
                        </tbody>
                </Table>
                <span style={{
                    color:'blue',
                    cursor:'pointer'
                    }}
                    onClick={handleShow}
                >+ Add New Candidate</span>
                <Formik
                        enableReinitialize={true}
                        initialValues={getinitialValues()}

                        validationSchema = {Yup.object({
                            name: Yup.string()
                                .required("Mandatory Field"),
                            address: Yup.string().required("Mandatory Field"),
                            dob: Yup.string().required("Mandatory Field"),
                            state: Yup.string().required("Mandatory Field"),
                            age:Yup.string().required("Mandatory Field"),
                            email: Yup.string().email().required("Mandatory Field")
                            
                        })}
                        onSubmit={(values,{setSubmitting})=>{
                            setTimeout(()=>{
                                setIswaiting(true);
                                if(iseditable)
                                {
                          
                                    props.socket.emit('editcandidate',values,editid,(response)=>{
                                        if(response){
                                            setIswaiting(false);
                                            handleClose();
                                            setUpdateValue(updateValue+1);
                                        }
                                    })
                                }
                                else{
                                   
                                    props.socket.emit('createcandidate',values,(response) =>{
                                        if(response){
                                            setIswaiting(false);
                                            handleClose();
                                            setUpdateValue(updateValue+1);
                                        }
                                    });
                                 }
                                setSubmitting(false);
                            },400);
                        }}
                    >
                <Modal
                    show={show}
                    onHide={handleClose}
                    backdrop="static"
                    keyboard={false}
                    size="lg"
                >
                    <Form>
                        <Modal.Header closeButton>
                            <Modal.Title>{iseditable?"Edit Candidate Details":"Create Candidate"}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                                <Row className="mb-3">
                                    <TextInput
                                        label="Name"
                                        name="name"
                                        id="name"
                                        placeholder="Enter Name"
                                        type="text"
                                    />
                                    <TextInput
                                        label="Address"
                                        name="address"
                                        id="address"
                                        placeholder="Enter Address"
                                        type="text"
                                    />
                                </Row>
                                <Row className="mb-3">
                                    <TextInput
                                        label="Date of Birth"
                                        name="dob"
                                        id="dob"
                                        placeholder="Enter Date of Birth"
                                        type="date"
                                    />   
                                    <SelectInput
                                        label="State"
                                        name="state"
                                        id="state"
                                        placeholder="Enter "
                                    >
                                        <option default value="">Open this select menu</option>
                                        {states.map((state,index) =>{
                                            return(
                                                <option key={index} value={state}>{state}</option>
                                            )
                                        })}
                                    </SelectInput>
                                </Row>
                                <Row className="mb-3">
                                    <TextInput
                                        label="Age"
                                        name="age"
                                        id="age"
                                        placeholder="Enter Age"
                                        type="text"
                                    />   
                                    <TextInput
                                        label="Email Address"
                                        name="email"
                                        id="email"
                                        placeholder="Enter Email Address"
                                        type="email"
                                    />   
                                </Row>
                        </Modal.Body>
                        <Modal.Footer className="gap-4">
                        <Button variant="outline-primary" size="lg" onClick={checkHandleClose}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="lg" type="submit">
                            {iseditable?"Update":"Create"}
                        </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
                </Formik>
            </Container>
            </>
        )
}

export default DashBoard;