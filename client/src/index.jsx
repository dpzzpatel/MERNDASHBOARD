import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import SignUp from './routes/signup';
import Login from './routes/login';
import Dashboard from './routes/dashboard';
import { io } from "socket.io-client";
import reportWebVitals from './reportWebVitals';


const socket = io("https://candidatedashboards.herokuapp.com/");



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login  socket={socket}/>} />
        <Route path="/signup" element={<SignUp socket={socket}/>} />
        <Route path="/dashboard" element={<Dashboard socket={socket}/>} />
        <Route path="*" element={<Login  socket={socket}/>} />
      </Routes>
      
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
