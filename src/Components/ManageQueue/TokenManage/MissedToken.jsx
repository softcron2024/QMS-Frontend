import React, { useState, useEffect, useRef } from 'react';
import { showErrorAlert, showSuccessAlert, showWarningAlert } from '../../../Toastify';
import '../../../assets/css/ManageQueue.css';

const MissedToken = () => {
  const [missed, setMissed] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [newPosition, setNewPosition] = useState('');
  const dragImageRef = useRef(null);
  const containerRef = useRef(null);
  const scrollIntervalRef = useRef(null);
  const initialOffsetRef = useRef({ x: 0, y: 0 });

  const fetchQueue = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/get-missed-tokens-list", {
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

      if (Array.isArray(result?.message)) {
        setMissed(result?.message);
      } else {
        console.error("Expected an array but got:", result?.message);
        setMissed([]);
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleMoveBtn = (token_no) => {
    setSelectedToken(token_no);
    setShowPopup(true);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/recall-missed-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          token_no: selectedToken,
          in_at: newPosition
        })
      });

      if (!response.ok) {
        throw new Error('Failed to recall missed token');
      }

      const result = await response.json();
      showSuccessAlert("Missed token recalled successfully");
      fetchQueue();
      setShowPopup(false);
    } catch (error) {
      showErrorAlert(error);
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("index", index);
    e.dataTransfer.effectAllowed = "move";

    // Calculate the initial offset
    const rect = e.currentTarget.getBoundingClientRect();
    initialOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Create a custom drag image
    const dragImage = e.currentTarget.cloneNode(true);
    dragImage.style.position = "fixed";
    dragImage.style.top = `${e.clientY - initialOffsetRef.current.y}px`;
    dragImage.style.left = `${e.clientX - initialOffsetRef.current.x}px`;
    dragImage.style.width = `${e.currentTarget.offsetWidth}px`;
    dragImage.style.height = `${e.currentTarget.offsetHeight}px`;
    dragImage.style.opacity = "1";
    dragImage.style.pointerEvents = "none"; // Ensures the drag image does not intercept mouse events
    dragImage.style.backgroundColor = "white"; // Ensure background is white
    dragImage.style.zIndex = "1000"; // Ensure it's above other elements
    document.body.appendChild(dragImage);

    dragImageRef.current = dragImage;

    // Create an invisible element as the drag image
    const invisibleDragImage = document.createElement('div');
    invisibleDragImage.style.width = '1px';
    invisibleDragImage.style.height = '1px';
    invisibleDragImage.style.opacity = '0';
    document.body.appendChild(invisibleDragImage);

    e.dataTransfer.setDragImage(invisibleDragImage, 0, 0);

    // Add dragging class
    e.currentTarget.classList.add("dragging");
  };

  const handleDrag = (e) => {
    if (dragImageRef.current) {
      dragImageRef.current.style.top = `${e.clientY - initialOffsetRef.current.y}px`;
      dragImageRef.current.style.left = `${e.clientX - initialOffsetRef.current.x}px`;
    }
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove("dragging");

    // Remove custom drag image
    if (dragImageRef.current) {
      document.body.removeChild(dragImageRef.current);
      dragImageRef.current = null;
    }

    clearInterval(scrollIntervalRef.current);
  };

  const handleDrop = (e, index) => {
    const draggedIndex = e.dataTransfer.getData("index");
    if (draggedIndex === index.toString()) return; // Prevents reordering with the same item

    const newMissed = [...missed];
    const [draggedItem] = newMissed.splice(draggedIndex, 1);
    newMissed.splice(index, 0, draggedItem);
    setMissed(newMissed);

    showWarningAlert("Cannot update position in missed list");
    clearInterval(scrollIntervalRef.current);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    const { clientY } = e;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const scrollOffset = 50; // Adjust this value as needed

    const scrollHandler = () => {
      if (clientY - containerRect.top < scrollOffset) {
        // Scroll up
        container.scrollTop -= scrollOffset;
      } else if (containerRect.bottom - clientY < scrollOffset) {
        // Scroll down
        container.scrollTop += scrollOffset;
      }
      scrollIntervalRef.current = requestAnimationFrame(scrollHandler);
    };

    scrollHandler(); // Initial call to start the scrolling
  };

  return (
    <div className='missed_token_main'>
      <div className="logo_name text-center col-12">
        <h2 className="fs-4 text-center">Missed List</h2>
      </div>
      <div className="queue_list" ref={containerRef} onDragOver={handleDragOver}>
        {missed.length > 0 && missed.map((item, index) => (
          <div onDrag={(e) => handleDrag(e)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, index)}
            onDragStart={(e) => handleDragStart(e, index)}
            draggable
            className={`draggable-item col-xl-10 col-lg-10 cursor-grab  ${item.transition ? 'drop-transition' : ''}`}
            key={item.token_no?.toString()}>
            <div className="card l-bg-blue-dark">
              <div className="card-statistic-3 p-4">
                <div className="card-icon card-icon-large"><i className="fas fa-users" /></div>
                <div className="mb-4 d-flex">
                  <h5 className="card-title col-8 fs-4 mb-0 text-white">Missed Customer</h5>
                  <div className="col-4">
                    <button onClick={() => handleMoveBtn(item.token_no)} className="btn custom-button-3 subtle w-full">Recall</button>
                  </div>
                </div>
                <div className='d-flex w-full justify-content-between'>
                  <div className="d-flex flex-column w-full bg-red-900">
                    <h2 className="d-flex align-items-center text-white mb-0">
                      Token No.  &nbsp;
                    </h2>
                    <h2 className="d-flex align-items-center text-white mb-0">
                      Customer Name  &nbsp;
                    </h2>
                    <h2 className="d-flex align-items-center text-white mb-0">
                      Customer Mobile  &nbsp;
                    </h2>
                  </div>
                  <div>{item && (
                    <div className="row align-items-center mb-1 d-flex">
                      <div className="col-12">
                        <h2 className="d-flex align-items-center text-white mb-0">
                          : &nbsp;{item.token_no}
                        </h2>
                      </div>
                      <div className="col-12">
                        <h2 className="d-flex align-items-center text-white mb-0">
                          : &nbsp;{item.customer_name}
                        </h2>
                      </div>
                      <div className="col-12">
                        <h2 className="d-flex align-items-center text-white mb-0">
                          : &nbsp;{item.customer_mobile}
                        </h2>
                      </div>
                    </div>
                  )}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h3>Enter New Position</h3>
            <input
              type="number"
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
            />
            <button className='btn_pop_up' onClick={handleSubmit}>Submit</button>
            <button className='btn_pop_up' onClick={() => setShowPopup(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissedToken;
