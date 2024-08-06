import React, { useState, useEffect } from 'react';
import TokenList from './TokenManage/TokenList';
import MissedToken from './TokenManage/MissedToken';
import '../../assets/css/ManageQueue.css';
import { showErrorAlert, showSuccessAlert, showWarningAlert } from '../../Toastify';

const ManageQueue = () => {
  const [currentToken, setcurrentToken] = useState(null);
  const [waitingToken, setwaitingToken] = useState([]);


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
      console.log(result?.message?.ResponseCode);
      if (result?.message?.ResponseCode === 0) {
        showWarningAlert(result?.message?.ResponseMessage)
        return
      }

      if (result?.message?.ResponseCode === 1) {
        setwaitingToken(result?.message)
        showSuccessAlert(result?.message)
        return
      }


    } catch (error) {
      console.error('Error fetching data:', error);
      showErrorAlert(`Error: ${error.message}`, { toastId: 'fetch-error-toast' });
    }
  };

  //#endregion

  //#region Get token when call next token and after scan_token
  useEffect(() => {
    let intervalId;
    const getCurrntToken = async () => {
      try {
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
    intervalId = setInterval(getCurrntToken, 5000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  //#endregion

  //#region Get Waiting to scan token on call next 
  const getWaitToken = async () => {
    try {
      const resp = await fetch("http://localhost:8000/api/v1//get-waiting-to-scan-token", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!resp.ok) {
        throw new Error(`Failed to fetch waiting token: ${resp.status} ${resp.statusText}`);
      }

      const result = await resp.json();
      if (result?.message?.ResponseCode === 1) {
        setwaitingToken(result.message);
      } else {
        setwaitingToken(null);
      }
    } catch (error) {
      console.error('Error fetching waiting token:', error);
    }
  };

  useEffect(() => {
    getWaitToken();
  }, []);
  //#endregion

  //#region Call skip from Waiting list
  const handleSkipBtn = async (token_no) => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/skip-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ token_no })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();

      if (result?.message?.ResponseCode === 0) {
        showWarningAlert(result?.message?.ResponseMessage)
      }

      if (result?.message?.ResponseCode === 1) {
        showSuccessAlert(result?.message?.ResponseMessage)

      }
      getWaitToken();
    } catch (error) {
      showErrorAlert(error.message);
    }
  };
  //#endregion

  //#region Show token click after complete token
  const handleComplete = async (token_no) => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/complete-token', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ token_no })
      });
      const result = await response.json();

      if (result?.message?.ResponseCode === 0) {
        showWarningAlert(result?.message?.ResponseMessage)
      }
      if (result?.message?.ResponseCode === 1) {
        showSuccessAlert(result?.message?.ResponseMessage)
      }
    } catch (error) {
      console.log(error);
    }
  };
  //#endregion

  return (
    <div className='manage_Queue_main'>
      <div className="operate_btn">
        <div className='buttons'>
          <button onClick={handleNextBtn}>Next</button>
        </div>
      </div>
      <div className='main_queue_css'>
        <div className="waiting_main_token">
          <div className="logo_name">
            <h2>Waiting Token</h2>
          </div>
          <div className="waiting_token">
            <h2 style={{ fontSize: "18px", fontWeight: 'bold', color: '#264653' }}>Current Waiting token</h2>
            {waitingToken && (
              <div key={waitingToken.token_no}>
                <p>
                  Queue no: <span>{waitingToken.token_no}</span>
                </p>
                <p>
                  Name: <span>{waitingToken.customer_name}</span>
                </p>
                <p>
                  Mobile: <span>{waitingToken.customer_mobile}</span>
                </p>
                <div className='Skip_btn'>
                  <button className='skip_btn' onClick={() => handleSkipBtn(waitingToken.token_no)}>skip</button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="waiting_main_nexttoken">
          <div className="logo_name">
            <h2>Softcron tecnology</h2>
          </div>
          <div className="waiting_token">

            {currentToken ? (
              <div key={currentToken.token_no}>
                <h2 style={{ fontSize: "18px", fontWeight: 'bold', color: '#264653' }}>Current Serving token</h2>
                <p>
                  Queue no: <span>{currentToken.token_no}</span>
                </p>
                <p>
                  Name: <span>{currentToken.customer_name}</span>
                </p>
                <p>
                  Mobile no: <span>{currentToken.customer_mobile}</span>
                </p>
                <div className='Skip_btn'>
                  <button className='skip_btn comp_btn' onClick={() => handleComplete(currentToken.token_no)}>Complete</button>
                </div>
              </div>
            ) : (
              <div className='no_token_available'>
                <h2>No token available</h2>
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
