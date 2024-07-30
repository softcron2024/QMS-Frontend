import React, { useState, useEffect } from 'react'
import TokenList from './TokenManage/TokenList'
import MissedToken from './TokenManage/MissedToken'
import '../../assets/css/ManageQueue.css'
import { showErrorAlert, showWarningAlert, showSuccessAlert } from '../../Toastify';

const ManageQueue = () => {
  const [currentToken, setcurrentToken] = useState(null)

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
        showErrorAlert(result?.message?.ResponseMessage);
        return; // Exit the function if there's an error
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      showErrorAlert(`Error: ${error.message}`, { toastId: 'fetch-error-toast' });
    }
  };

  //#endregion

  useEffect(() => {
    async function getCurrntToken() {
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
        console.log(currentTokenResult);

        if (currentTokenResult?.message?.ResponseCode === 0) {
          // showErrorAlert(currentTokenResult?.message?.ResponseMessage);
          return; // Exit the function if there's an error
        }

        if (currentTokenResult?.message?.ResponseCode === 1) {
          setcurrentToken(currentTokenResult.message);
          // showSuccessAlert(currentTokenResult.message.ResponseMessage);
        } else {
          setcurrentToken(null);
          // showWarningAlert('No tokens available.', { toastId: 'no-tokens-toast' });
        }
      } catch (error) {
        // showErrorAlert(`Error fetching current token: ${error.message}`, { toastId: 'fetch-error-toast' });
      }
    }

    setInterval(() => {
      getCurrntToken()
    },600);
  })

  //#region handle moved back for call Next button
  // const handleMoveBack = async (token_no) => {
  //   if (!token_no) return;

  //   try {
  //     const response = await fetch("http://localhost:8000/api/v1/move-back-current-token", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ token_no }),
  //       credentials: "include",
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
  //     }

  //     const result = await response.json();
  //     if (result?.message?.ResponseCode === 1) {
  //       setCallNextToken(null);
  //       const tokenData = {
  //         value: result?.message,
  //         timestamp: new Date().getTime(),
  //       };
  //       localStorage.setItem('callNextToken', JSON.stringify(tokenData));

  //       setTimeout(() => {
  //         localStorage.removeItem('callNextToken');
  //       }, 300000);
  //       showSuccessAlert(result?.message?.ResponseMessage, { toastId: 'move-back-success-toast' });
  //     } else {
  //       setCallNextToken(null);
  //       showWarningAlert(result?.message?.ResponseMessage, { toastId: 'move-back-warning-toast' });
  //     }
  //   } catch (error) {
  //     console.error('Error moving back token:', error);
  //     showErrorAlert('Error moving back token:', error);
  //   }
  // };
  //#endregion


  return (
    <div className='manage_Queue_main'>
      <div className='main_queue_css'>
        <div className="operate_btn">
          <div className='buttons'>
            <button onClick={handleNextBtn}>Next</button>
            {/* <button onClick={() => handleMoveBack(callNextToken?.token_no)}>Move Back</button> */}
          </div>
        </div>
        <div className="Queue_logo">
          <h2>Softcron Tecnology</h2>
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
  )
}

export default ManageQueue