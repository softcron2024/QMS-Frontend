import React, { useState, useRef, useEffect } from "react";
import '../../assets/css/GeneratToken.css';
import { Link, Navigate, } from "react-router-dom";
import Modal from 'react-modal';
import { useReactToPrint } from "react-to-print";
import Cookies from "js-cookie";
import { showErrorAlert, showSuccessAlert, showWarningAlert } from "../../Toastify";

const GenerateToken = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [Token, setToken] = useState({
    name: "",
    mobile: "",
    no_of_person: "",
    customer_type_id: ""
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [Options, setOptions] = useState([]);
  const [selectedCustomerType, setSelectedCustomerType] = useState("Select Customer type");
  console.log(Options);

  //#region Fetch token for customer Type
  useEffect(() => {
    const getCustomerTypes = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/get-customer-type', {
          credentials: 'include',
        });
        const results = await response.json();

        if (Array.isArray(results)) {
          setOptions(results);
        } else if (results && Array.isArray(results.message)) {
          setOptions(results.message);
        } else {
          setOptions([]);
          console.error('Expected an array, but got:', results);
        }
      } catch (error) {
        console.error('Error fetching customer types:', error);
        setOptions([]);
      }
    };
    getCustomerTypes();
  }, []);
  //#endregion

  const printRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleTokenChange = (e) => {
    setToken({ ...Token, [e.target.name]: e.target.value });
  };

  const handleCustomerTypeChange = (type) => {
    setToken({ ...Token, customer_type_id: type.customer_type_id });
    setSelectedCustomerType(type.customer_type_name);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  //#region Create Token API For generate
  const handleCreateToken = async (e) => {
    e.preventDefault();

    // Validation
    const { name, mobile, no_of_person, customer_type_id } = Token;
    if (!name || !mobile || !no_of_person || !customer_type_id) {
      showWarningAlert("All fields are required.");
      return;
    }

    const mobilePattern = /^[0-9]+$/;
    if (!mobilePattern.test(mobile)) {
      showWarningAlert("Please enter a valid mobile number.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/generate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Token),
        credentials: "include",
      });
      const result = await response.json();
      console.log(result);

      if (result?.ResponseCode === 0) {
        showWarningAlert(result?.message);
      } else if (result?.ResponseCode === 1) {
        setReceiptData(result?.message);
        setIsModalOpen(true);
      } else {
        showWarningAlert(result?.message?.ResponseMessage);
      }

      setToken({
        name: "",
        mobile: "",
        no_of_person: "",
        customer_type_id: "",
      });
      showSuccessAlert("Token generated successfully");
    } catch (error) {
      showErrorAlert("Error generating token:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  //#endregion

  const closeModal = () => {
    setIsModalOpen(false);
    setReceiptData(null);
  };

  const isAuthenticated = Cookies.get("token") !== undefined;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div>
      <div className="container">
        <div className="button-container">
          <button className="d-none d-sm-block">
            <Link className="btn btn-primary" to="/dashboard">Back</Link>
          </button>
          <h1 className="custom-h1">Softcron Technology</h1>
        </div>
        <div className="input-container">
          <input type="text" className="form-control" name="name" value={Token.name} onChange={handleTokenChange} placeholder="Name (required)" />
          <input className="form-control" type="text" name="mobile" value={Token.mobile} onChange={handleTokenChange} placeholder="Mobile Number (required)" />
          <div className="dropdown">
            <button className="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
              {selectedCustomerType}
            </button>
            <ul className="dropdown-menu">
              {Options.map((type) => (
                <li key={type.customer_type_id}>
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={() => handleCustomerTypeChange(type)}
                  >
                    {type.customer_type_name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="input-container">
          <input className="form-control" type="text" name="no_of_person" value={Token.no_of_person} onChange={handleTokenChange} placeholder="No. of person (required)" />
        </div>
        <div className="d-grid gap-2">
          <button className="btn btn-primary" onClick={handleCreateToken}>Generate Token</button>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Receipt"
        ariaHideApp={false}
      >
        <button className="btn_close" onClick={closeModal}>Close</button>
        <div className="Print_button_receipt">
          <button className="btn_print" onClick={handlePrint}>Print</button>
        </div>
        <div className="pop_up" ref={printRef}>
          <div>
            <h2>Softcron Technology</h2>
          </div>
          {receiptData && (
            <div>
              <div className="detail_Token_receipt">
                <div className="head_date_token">
                  <p>Token_No: {receiptData.token_no}</p>
                  <p>Date: {formatDate(receiptData.created_datetime)}</p>
                </div>
                <div className="detail_of_users">
                  <p>Name: {receiptData.name}</p>
                  <p>Mobile: {receiptData.mobile}</p>
                  <p>No. of Person: {receiptData.no_of_person}</p>
                  <p>Token ID: {receiptData.token_id}</p>
                </div>
                <div className="QR_Code">
                  <img src={receiptData.qr_b64} alt="QRCode" />
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default GenerateToken;
