import React, { useState, useEffect } from 'react';
import TokenList from './TokenManage/TokenList';
import MissedToken from './TokenManage/MissedToken';
import '../../assets/css/ManageQueue.css';
import { showErrorAlert, showSuccessAlert, showWarningAlert } from '../../Toastify';

const ManageQueue = () => {
  const [currentToken, setcurrentToken] = useState(null);

  //#region Call Next from Queue List 
  const handleNextBtn = async () => {
    try {
      // Fetch the next token
      const response = await fetch("http://localhost:8000/api/v1/call-next-token", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(result);

      if (result?.message?.ResponseCode === 0) {
        showWarningAlert(result?.message?.ResponseMessage);
        return; // Exit the function if there's an error
      }
      if (result?.message?.ResponseCode === 1) {
        showSuccessAlert(result?.message?.ResponseMessage);
        return; // Exit the function if there's an error
      }

      

    } catch (error) {
      console.error('Error fetching data:', error);
      showErrorAlert(`Error: ${error.message}`, { toastId: 'fetch-error-toast' });
    }
  };

  //#endregion

  useEffect(() => {
    let intervalId;

    const getCurrntToken = async () => {
      try {
        // Fetch the current token
        const resp = await fetch("http://localhost:8000/api/v1/get-current-token", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!resp.ok) {
          throw new Error(`Failed to fetch current token: ${resp.status} ${resp.statusText}`);
        }

        const currentTokenResult = await resp.json();
        if (currentTokenResult?.message?.ResponseCode === 1) {
          setcurrentToken(currentTokenResult.message);
        } else {
          setcurrentToken(null);
        }
      } catch (error) {
        console.error('Error fetching current token:', error);
      }
    };

    intervalId = setInterval(getCurrntToken, 5000); // Increase interval to 5 seconds

    return () => {
      clearInterval(intervalId); // Clear interval on component unmount
    };
  }, []);

  return (
    <div className='manage_Queue_main'>
      <div className='main_queue_css'>
        <div className="operate_btn">
          <div className='buttons'>
            <button onClick={handleNextBtn}>Next</button>
          </div>
        </div>
        <div className="Queue_logo">
          <h2>Softcron Technology</h2>
          <div className="show_queue">
            {currentToken && (
              <div key={currentToken.token_no}>
                <h2>Current Serving</h2>
                <p>
                  Queue no: <span>{currentToken.token_no}</span>
                </p>
                <p>
                  Name: <span>{currentToken.Customer_name}</span>
                </p>
                <p>
                  Mobile no: <span>{currentToken.Customer_mobile}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="show_queue_token">
        <TokenList />
        <MissedToken />
      </div>
    </div>
  );
}

export default ManageQueue;
