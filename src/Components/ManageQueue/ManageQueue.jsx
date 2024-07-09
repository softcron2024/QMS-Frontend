import React, { useEffect, useState } from 'react';
import '../../assets/css/ManageQueue.css';
import { Link } from 'react-router-dom';
import TokenList from './TokenManage/TokenList';
import MissedToken from './TokenManage/MissedToken';

const ManageQueue = () => {
  const [callNextToken, setCallNextToken] = useState(null);

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

      if (result.message && result.message.ResponseCode === 1) {
        setCallNextToken(result.message);
      } else {
        setCallNextToken(null);
        alert('No tokens available.');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert(`Error: ${error.message}`);
    }
  };


  return (
    <div className='main_queue_container'>
      <div className="calling_buttons">
        <div className='btn1' onClick={handleNextBtn}>Next</div>
      </div>
      <div className='main_manage_queue'>
        <div className='manage_Queue_container'>
          <div className="manage_queue">
            <div className="second_queue_container">
              <div className="logoname">
                <Link className='link_logo' to='/dashboard'> Softcron Technology </Link>
              </div>

              <div className="queue_name">
                {callNextToken && (
                  <div key={callNextToken.token_no}>
                    <h2>Current Serving</h2>
                    <h4>
                      Queue no: <span>{callNextToken.token_no}</span>
                    </h4>
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

            <div className="bottom_container">
              <h3>Total Scanned Token</h3>
              <p><span>4</span></p>
            </div>
          </div>
        </div>
      </div>
      <div className="right_div">
        <div className="main_right_list_container">
          <TokenList />
        </div>
        <div className='missed_bottom_token'>
          <MissedToken />
        </div>
      </div>
    </div>
  );
}

export default ManageQueue;
