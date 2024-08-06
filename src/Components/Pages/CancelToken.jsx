import React, { useEffect, useState } from 'react';
import '../../assets/css/CancelToken.css';
import { showSuccessAlert, showErrorAlert, showWarningAlert } from '../../Toastify';

const CancelToken = () => {
  const [canceltoken, setCanceltoken] = useState([]);
  const [tokenNo, setTokenNo] = useState("");

  const fetchQueue = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/getQueue", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();

      if (Array.isArray(result?.message[0])) {
        setCanceltoken(result?.message[0]);
      } else {
        console.error("Expected an array but got:", result?.message[0]);
        setCanceltoken([]);
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleCancelToken = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/api/v1/cancel-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token_no: tokenNo }),
      });

      const result = await response.json();
      if (result.ResponseCode === 0) {
        showErrorAlert(result.message);
        return;
      }

      if (result.message.ResponseCode === 0) {
        showWarningAlert(result.message.ResponseMessage);
      }
      else if (result.message.ResponseCode === 1) {
        showSuccessAlert(result.message.ResponseMessage);
      }
    } catch (error) {
      console.error('Error cancelling token:', error);
    }
  };

  return (
    <div className='main_container_cancel'>
      <form className="input_cancel" onSubmit={handleCancelToken}>
        <div className="logo_cancel">
          Softcron Technology
        </div>
        <div className="subscribe">
          <p>Cancel Token</p>
          <input type="text" 
            placeholder="Enter Token No" 
            value={tokenNo}
            onChange={(e) => setTokenNo(e.target.value)}
          />
          <br />
          {tokenNo && (
            <div className="submit-btn">
              <button type="submit">Cancel</button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default CancelToken;
