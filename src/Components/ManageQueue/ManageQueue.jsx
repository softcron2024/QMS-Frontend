import React, { useState, useEffect } from 'react'
import TokenList from './TokenManage/TokenList'
import MissedToken from './TokenManage/MissedToken'
import '../../assets/css/ManageQueue.css'
import { showErrorAlert, showWarningAlert, showSuccessAlert } from '../../Toastify';

const ManageQueue = () => {
  const [callNextToken, setCallNextToken] = useState(null);

  //#region Call Next from Queue List 
  const handleNextBtn = async () => {
    try {
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

      console.log(result.message);
      if (result?.message) {
        setCallNextToken(result?.message);
        const tokenData = {
          value: result?.message,
          timestamp: new Date().getTime(),
        };
        localStorage.setItem('callNextToken', JSON.stringify(tokenData));
      } else {
        setCallNextToken(null);
        showWarningAlert('No tokens available.', { toastId: 'no-tokens-toast' });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showErrorAlert(`Error: ${error.message}`, { toastId: 'fetch-error-toast' });
    }
  };
  //#endregion

  //#region Call next after delete 1 minute from local storage
  useEffect(() => {
    const storedToken = localStorage.getItem('callNextToken');
    if (storedToken) {
      const tokenData = JSON.parse(storedToken);
      const currentTime = new Date().getTime();
      const FIVE_MINUTES = 5 * 60 * 1000;

      setCallNextToken(tokenData.value);
      const timeRemaining = FIVE_MINUTES - (currentTime - tokenData.timestamp);
      const timeout = setTimeout(() => {
        localStorage.removeItem('callNextToken');
        setCallNextToken(null);
      }, timeRemaining);
      return () => clearTimeout(timeout);
    } else {
      localStorage.removeItem('callNextToken');
    }
  }, []);
  //#endregion

  //#region handle moved back for call Next button
  const handleMoveBack = async (token_no) => {
    if (!token_no) return;

    try {
      const response = await fetch("http://localhost:8000/api/v1/move-back-current-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token_no }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      if (result?.message?.ResponseCode === 1) {
        setCallNextToken(null);
        const tokenData = {
          value: result?.message,
          timestamp: new Date().getTime(),
        };
        localStorage.setItem('callNextToken', JSON.stringify(tokenData));

        setTimeout(() => {
          localStorage.removeItem('callNextToken');
        }, 300000);
        showSuccessAlert(result?.message?.ResponseMessage, { toastId: 'move-back-success-toast' });
      } else {
        setCallNextToken(null);
        showWarningAlert(result?.message?.ResponseMessage, { toastId: 'move-back-warning-toast' });
      }
    } catch (error) {
      console.error('Error moving back token:', error);
      showErrorAlert('Error moving back token:', error);
    }
  };
  //#endregion


  return (
    <div className='manage_Queue_main'>
      <div className='main_queue_css'>
        <div className="operate_btn">
          <div className='buttons'>
            <button onClick={handleNextBtn}>Next</button>
            <button onClick={() => handleMoveBack(callNextToken?.token_no)}>Move Back</button>
          </div>
        </div>
        <div className="Queue_logo">
          <h2>Softcron Tecnology</h2>
          <div className="show_queue">
            {callNextToken && (
              <div key={callNextToken.token_no}>
                <h2>Current Serving</h2>
                <p>
                  Queue no: <span>{callNextToken.token_no}</span>
                </p>
                <p>
                  Name: <span>{callNextToken.customer_name}</span>
                </p>
                <p>
                  Mobile no: <span>{callNextToken.customer_mobile}</span>
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
  )
}

export default ManageQueue