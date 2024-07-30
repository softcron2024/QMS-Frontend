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
  }, [missed]);

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

    // Create a custom drag image
    const dragImage = e.currentTarget.cloneNode(true);
    dragImage.style.position = "fixed";
    dragImage.style.top = `${e.clientY - e.currentTarget.offsetHeight / 2}px`;
    dragImage.style.left = `${e.clientX - e.currentTarget.offsetWidth / 2}px`;
    dragImage.style.width = `${e.currentTarget.offsetWidth}px`;
    dragImage.style.height = `${e.currentTarget.offsetHeight}px`;
    dragImage.style.opacity = "1";
    dragImage.style.pointerEvents = "none"; // Ensures the drag image does not intercept mouse events
    dragImage.style.backgroundColor = "white"; // Ensure background is white
    dragImage.style.zIndex = "1000"; // Ensure it's above other elements
    document.body.appendChild(dragImage);

    dragImageRef.current = dragImage;

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = rect.width / 2;
    const offsetY = rect.height / 2;
    e.dataTransfer.setDragImage(dragImage, offsetX, offsetY);

    // Add dragging class
    e.currentTarget.classList.add("dragging");
  };

  const handleDrag = (e) => {
    if (dragImageRef.current) {
      dragImageRef.current.style.top = `${e.clientY - dragImageRef.current.offsetHeight / 2}px`;
      dragImageRef.current.style.left = `${e.clientX - dragImageRef.current.offsetWidth / 2}px`;
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

    showWarningAlert("Cannot update position in missed list")
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
      <div className="logo_name">
        <h2>Missed Tokens</h2>
      </div>
      <div className="queue_list" ref={containerRef} onDragOver={handleDragOver}>
        {missed.length > 0 ? (
          missed.map((item, index) => (
            <div
              key={item.token_no.toString()}
              className="draggable-item"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDrag={(e) => handleDrag(e)}
              onDragEnd={(e) => handleDragEnd(e)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, index)}
            >
              <p>Queue No:<span>{item.token_no}</span></p>
              <p>Name:<span>{item.customer_name}</span></p>
              <p>Mobile:<span>{item.customer_mobile}</span></p>
              <div className='skip_btn' onClick={() => handleMoveBtn(item.token_no)}>Recall</div>
            </div>
          ))
        ) : (
          <div className="draggable-item">
            <p>No missed tokens</p>
          </div>
        )}
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
