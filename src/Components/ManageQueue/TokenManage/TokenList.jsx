import React, { useState, useEffect, useRef } from 'react';
import { showErrorAlert, showSuccessAlert } from '../../../Toastify';
import '../../../assets/css/ManageQueue.css';
import { logDOM } from '@testing-library/react';

const TokenList = () => {
  const [queue, setQueue] = useState([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const dragImageRef = useRef(null);
  const containerRef = useRef(null);
  const scrollIntervalRef = useRef(null);

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
        setQueue(result?.message[0]);
      } else {
        console.error("Expected an array but got:", result?.message[0]);
        setQueue([]);
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [queue]); // Only run once on mount

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
      fetchQueue();
    } catch (error) {
      showErrorAlert(error.message);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
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
    setDraggedItemIndex(null);

    // Remove custom drag image
    if (dragImageRef.current) {
      document.body.removeChild(dragImageRef.current);
      dragImageRef.current = null;
    }

    clearInterval(scrollIntervalRef.current);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const draggedIndex = e.dataTransfer.getData("index");
    if (draggedIndex === index.toString()) return; // Prevents reordering with the same item

    const newQueue = [...queue];
    const [draggedItem] = newQueue.splice(draggedIndex, 1);
    newQueue.splice(index, 0, draggedItem);
    
    // Apply transition class to the dropped item
    const droppedItem = newQueue[index];
    droppedItem.transition = true;
    setQueue(newQueue);

    // Remove the transition class after the transition duration
    setTimeout(() => {
      droppedItem.transition = false;
      setQueue([...newQueue]);
    }, 300); // The duration should match the CSS transition duration

    // Send only the moved token number and new position to the server
    updateTokenPosition(draggedItem.token_no, index + 1);

    clearInterval(scrollIntervalRef.current);
  };

  const updateTokenPosition = async (token_no, newPosition) => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/adjust-token-position", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          token_no,
          in_at: newPosition
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update token position');
      }

      const result = await response.json();
      console.log(result);
      
      showSuccessAlert("Token position updated successfully");
    } catch (error) {
      showErrorAlert(error.message);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    const { clientY } = e;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const scrollOffset = 50; // Adjust this value as needed

    clearInterval(scrollIntervalRef.current);

    const scrollHandler = () => {
      if (clientY - containerRect.top < scrollOffset) {
        // Scroll up
        container.scrollTop -= scrollOffset;
      } else if (containerRect.bottom - clientY < scrollOffset) {
        // Scroll down
        container.scrollTop += scrollOffset;
      }
    };

    scrollIntervalRef.current = requestAnimationFrame(scrollHandler);
  };

  return (
    <div className='missed_token_main'>
      <div className="logo_name">
        <h2>Queue List</h2>
      </div>
      <div className="queue_list" ref={containerRef} onDragOver={handleDragOver}>
        {queue.length > 0 ? (
          queue.map((item, index) => (
            <div
              key={item.token_no?.toString()} // Safely access token_no
              className={`draggable-item ${draggedItemIndex === index ? 'dragging' : ''} ${item.transition ? 'drop-transition' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDrag={(e) => handleDrag(e)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, index)}
            >
              <p>Queue No:<span>{item.token_no}</span></p>
              <p>Name:<span>{item.customer_name}</span></p>
              <p>Mobile:<span>{item.customer_mobile}</span></p>
              <div className='skip_btn' onClick={() => handleSkipBtn(item.token_no)}>Skip</div>
            </div>
          ))
        ) : (
          <div className="draggable-item">
            <p>No tokens in the queue</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenList;
