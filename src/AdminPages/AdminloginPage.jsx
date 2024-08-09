import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "./AdminloginPage.css";
import image from "./image.jpg";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from "js-cookie";

const AdminLoginPage = () => {
  const [obj, setObj] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();

  const isAuthenticated = Cookies.get("token") !== undefined;


  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setObj({ ...obj, [e.target.name]: e.target.value });
  };
  const isFormValid = obj.username !== "" && obj.password !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/v1/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(obj),
        credentials: "include",
      });

      const result = await response.json();

      if (result.ResponseCode === 0) {
        toast.warning(result.message);
        return;
      }

      if (result.message.ResponseCode === 0) {
        toast.warning(result.message.ResponseMessage);
        return;
      }

      if (result.ResponseCode === 1) {
        toast.success(result.message);
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
        try {
          const statusResponse = await fetch(
            "http://localhost:8000/api/v1/getQueue",
            {
              method: "GET",
              credentials: "include",
            }
          );

          const statusResult = await statusResponse.json();

          if (statusResult.message === "Unauthorized") {
            toast.error("Session expired, please log in again.");
            navigate("/admin-login");
          } else {

            let cookieArr = document.cookie.split(";");
          }
        } catch (error) {
          toast.error(error)
        }
      }
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <div className="loginParent">
      <div className="container">
        <div className="cover">
          <div className="front">
            <img src={image} alt="backgroundimage" />
            <div className="text"></div>
          </div>
        </div>
        <div className="forms">
          <div className="form-content">
            <div className="login-form">
              <div className="title">Admin Login</div>
              <form onSubmit={handleSubmit}>
                <div className="input-boxes">
                  <div className="input-box">
                    <i className="fas fa-envelope"></i>
                    <input
                      onChange={handleChange}
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Enter your username"
                      value={obj.username}
                      required
                    />
                  </div>
                  <div className="input-box">
                    <i className="fas fa-lock"></i>
                    <input
                      onChange={handleChange}
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={obj.password}
                      required
                    />
                  </div>
                  <div className="button input-box">
                    <input type="submit" value="Submit" />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AdminLoginPage;
