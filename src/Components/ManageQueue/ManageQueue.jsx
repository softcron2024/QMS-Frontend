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


  //#region Get token when call next token and after scan_token
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
  //#endregion

  const getWaitToken = async () => {
    try {
      const resp = await fetch("http://localhost:8000/api/v1/get-waiting-token", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
      }

      const result = await resp.json();
      if (result && result.message) {
        setwaitingToken(result.message);
      } else {
        setwaitingToken([]);
      }
    } catch (error) {
      console.error('Error fetching waiting token:', error);
      setwaitingToken([]);
    }
  };

  useEffect(() => {
    getWaitToken();
  }, [waitingToken]);

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
      showSuccessAlert("Token skipped successfully");
      getWaitToken();
    } catch (error) {
      showErrorAlert(error.message);
    }
  };

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

            {currentToken && (
              <div key={currentToken.token_no}>
                <h2 style={{fontSize:"18px", fontWeight:'bold', color:'#264653'}}>Current Serving</h2>
                <p>
                  Queue no: <span>{currentToken.token_no}</span>
                </p>
                <p>
                  Name: <span>{currentToken.Customer_name}</span>
                </p>
                <p>
                  Mobile no: <span>{currentToken.Customer_mobile}</span>
                </p>
                <div className='Skip_btn'>
                    <button className='skip_btn comp_btn'>Complete</button>
                  </div>
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
