import React, { useState, useEffect } from 'react';
import TokenList from './TokenManage/TokenList';
import MissedToken from './TokenManage/MissedToken';
import '../../assets/css/ManageQueue.css';
import { showErrorAlert, showSuccessAlert, showWarningAlert } from '../../Toastify';

const ManageQueue = () => {
  const [currentToken, setcurrentToken] = useState(null);
  const [waitingToken, setwaitingToken] = useState(null);

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
        showErrorAlert("Error fetching current token")
      }
    };
    intervalId = setInterval(getCurrntToken, 1000);
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
      showErrorAlert("Error fetching waiting token")
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
      showErrorAlert("Something went wrong")
    }
  };
  //#endregion

  return (
    <div className='manage_Queue_main col-12'>
      <div className="operate_btn">
        <div className=''>
          <button className='btn custom-button ms-5' onClick={handleNextBtn}>Call Next to Scan</button>
        </div>
      </div>
      <div className='main_queue_css col-12'>
        <div className="waiting_main_token">
          <div className={`${waitingToken ? "col-xl-8 col-lg-8" : "col-xl-8 col-lg-8"} card-position`}>
            <div className="card l-bg-blue-dark">
              <div className="card-statistic-3 p-4">
                <div className="card-icon card-icon-large"><i className="fas fa-users" /></div>
                <div className="mb-4 d-flex flex-column flex-md-row  align-items-center">
                  {
                    waitingToken ? <div className="col-12 col-sm-10 col-md-8">
                      <h5 className="card-title col-12 d-md-block ml-0 d-none fs-6 mb-0 text-white">Current Waiting Token</h5>
                      <h5 className="card-title col-12 d-md-none d-sm-block d-none custom-text ml-0 d-none fs-6 mb-0 text-white">Current Waiting Token</h5>
                      <h5 className="card-title col-12 d-sm-none d-block custom-text mb-0 text-white">Current Waiting Token</h5>
                    </div> : <div className="col-10 custom-width">
                      <h5 className="card-title col-12 d-md-block ml-0 d-none fs-5 mb-0 text-white">Current Waiting Token</h5>
                      <h5 className="card-title col-12 d-md-none d-sm-block d-none ml-0 d-none fs-6 mb-0 text-white">Current Waiting Token</h5>
                      <h5 className="card-title col-12 d-sm-none d-block fs-5 mb-0 text-white">Current Waiting Token</h5>
                    </div>
                  }
                  {
                    waitingToken ? <div className="col-4">
                      <button onClick={() => handleSkipBtn(waitingToken?.token_no)} className="btn   mt-md-0 mt-2 custom-button-2 w-full">Skip</button>
                    </div> : ""
                  }
                </div>
                {waitingToken ? (
                  <div className='d-flex w-full justify-content-between'>

                    <div className="d-flex flex-column w-full bg-red-900">
                      <h2 className="d-flex align-items-center fs-6 text-white mb-0">
                        <span style={{ width: '150px' }}>Token No.</span>
                        <span>:&nbsp;</span>
                        <span className="ml-2">{waitingToken?.token_no}</span>
                      </h2>

                      <h2 className="d-flex align-items-center fs-6 text-white mb-0">
                        <span style={{ width: '150px' }}>Customer Name</span>
                        <span>:&nbsp; </span>
                        <span className="ml-2">{waitingToken?.customer_name}</span>
                      </h2>

                      <h2 className="d-flex align-items-center fs-6 text-white mb-0">
                        <span style={{ width: '150px' }}>Customer Mobile</span>
                        <span>:&nbsp;</span>
                        <span className="ml-2">{waitingToken?.customer_mobile}</span>
                      </h2>
                    </div>

                  </div>
                ) :
                  <div className="row align-items-center mb-1 d-flex">
                    <div className="col-12">
                      <h5 className="card-title col-12 d-md-block ml-0 d-none fs-5 mb-0 text-white">Nothing to show</h5>
                      <h5 className="card-title col-12 d-md-none d-sm-block d-none ml-0 d-none fs-6 mb-0 text-white">Nothing to show</h5>
                      <h5 className="card-title col-12 d-sm-none d-block fs-6 mb-0 text-white">Nothing to show</h5>
                    </div>

                  </div>}
              </div>
            </div>
          </div>
        </div>
        <div className="waiting_main_nexttoken">
        <div className={`${currentToken ? "col-xl-8 col-lg-8" : "col-xl-8 col-lg-8"} card-position`}>
            <div className="card l-bg-blue-dark">
              <div className="card-statistic-3 p-4">
                <div className="card-icon card-icon-large"><i className="fas fa-users" /></div>
                <div className="mb-4 d-flex flex-column flex-md-row  align-items-center">
                  {
                    currentToken ? <div className="col-12 col-sm-10 col-md-8">
                      <h5 className="card-title col-12 d-md-block ml-0 d-none fs-6 mb-0 text-white">In Process Token</h5>
                      <h5 className="card-title col-12 d-md-none d-sm-block d-none custom-text ml-0 d-none fs-6 mb-0 text-white">In Process Token</h5>
                      <h5 className="card-title col-12 d-sm-none d-block custom-text mb-0 text-white">In Process Token</h5>
                    </div> : <div className="col-12 custom-width">
                      <h5 className="card-title col-12 d-md-block ml-0 d-none fs-5 mb-0 text-white">In Process Token</h5>
                      <h5 className="card-title col-12 d-md-none d-sm-block d-none ml-0 d-none fs-6 mb-0 text-white">In Process Token</h5>
                      <h5 className="card-title col-12 d-sm-none d-block fs-5 mb-0 text-white">In Process Token</h5>
                    </div>
                  }
                  {
                    currentToken ? <div className="col-4">
                      <button onClick={() => handleComplete(currentToken?.token_no)} className="btn   mt-md-0 mt-2 custom-button-3 w-full">Recall</button>
                    </div> : ""
                  }
                </div>
                {currentToken ? (
                  <div className='d-flex w-full justify-content-between'>

                    <div className="d-flex flex-column w-full bg-red-900">
                      <h2 className="d-flex align-items-center fs-6 text-white mb-0">
                        <span style={{ width: '150px' }}>Token No.</span>
                        <span>:&nbsp;</span>
                        <span className="ml-2">{currentToken?.token_no}</span>
                      </h2>

                      <h2 className="d-flex align-items-center fs-6 text-white mb-0">
                        <span style={{ width: '150px' }}>Customer Name</span>
                        <span>:&nbsp; </span>
                        <span className="ml-2">{currentToken?.customer_name}</span>
                      </h2>

                      <h2 className="d-flex align-items-center fs-6 text-white mb-0">
                        <span style={{ width: '150px' }}>Customer Mobile</span>
                        <span>:&nbsp;</span>
                        <span className="ml-2">{currentToken?.customer_mobile}</span>
                      </h2>
                    </div>

                  </div>
                ) :
                  <div className="row align-items-center mb-1 d-flex">
                    <div className="col-12">
                      <h5 className="card-title col-12 d-md-block ml-0 d-none fs-5 mb-0 text-white">Nothing to show</h5>
                      <h5 className="card-title col-12 d-md-none d-sm-block d-none ml-0 d-none fs-6 mb-0 text-white">Nothing to show</h5>
                      <h5 className="card-title col-12 d-sm-none d-block fs-6 mb-0 text-white">Nothing to show</h5>
                    </div>

                  </div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="show_queue_token d-flex flex-column flex-sm-row justify-content-around">
        <TokenList />
        <MissedToken />
      </div>
    </div>
  );
}

export default ManageQueue;
