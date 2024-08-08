import React, { useState, useEffect, useRef } from 'react';
import { showErrorAlert, showSuccessAlert } from '../../../Toastify';
import '../../../assets/css/ManageQueue.css';

const TokenList = () => {
  const [queue, setQueue] = useState([]);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragImageRef = useRef(null);
  const containerRef = useRef(null);
  const scrollAnimationRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/v1/getQueue", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!response.ok) throw new Error('Failed to fetch data');

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

    fetchQueue();
  }, []);

  const handleSkipBtn = async (token_no) => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/skip-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token_no }),
      });

      if (!response.ok) throw new Error('Failed to fetch data');

      const result = await response.json();
      showSuccessAlert("Token skipped successfully");
    } catch (error) {
      showErrorAlert(error.message);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const dragImage = e.currentTarget.cloneNode(true);
    Object.assign(dragImage.style, {
      position: "fixed",
      top: `${e.clientY - dragOffset.current.y}px`,
      left: `${e.clientX - dragOffset.current.x}px`,
      width: `${e.currentTarget.offsetWidth}px`,
      height: `${e.currentTarget.offsetHeight}px`,
      opacity: "1",
      pointerEvents: "none",
      backgroundColor: "white",
      zIndex: "1000",
    });

    document.body.appendChild(dragImage);
    dragImageRef.current = dragImage;

    const invisibleDragImage = document.createElement('div');
    Object.assign(invisibleDragImage.style, {
      width: '1px',
      height: '1px',
      opacity: '0',
    });
    document.body.appendChild(invisibleDragImage);
    e.dataTransfer.setDragImage(invisibleDragImage, 0, 0);

    e.currentTarget.classList.add("dragging");
  };

  const handleDrag = (e) => {
    if (dragImageRef.current) {
      dragImageRef.current.style.top = `${e.clientY - dragOffset.current.y}px`;
      dragImageRef.current.style.left = `${e.clientX - dragOffset.current.x}px`;
    }
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove("dragging");
    setDraggedItemIndex(null);
    setIsDragging(false);

    if (dragImageRef.current) {
      document.body.removeChild(dragImageRef.current);
      dragImageRef.current = null;
    }

    cancelAnimationFrame(scrollAnimationRef.current);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    const draggedIndex = e.dataTransfer.getData("index");
    if (draggedIndex === index.toString()) return;

    const newQueue = [...queue];
    const [draggedItem] = newQueue.splice(draggedIndex, 1);
    newQueue.splice(index, 0, draggedItem);

    const droppedItem = newQueue[index];
    droppedItem.transition = true;
    setQueue(newQueue);

    setTimeout(() => {
      droppedItem.transition = false;
      setQueue([...newQueue]);
    }, 300);

    updateTokenPosition(draggedItem.token_no, index + 1);
    cancelAnimationFrame(scrollAnimationRef.current);
  };

  const updateTokenPosition = async (token_no, newPosition) => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/adjust-token-position", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token_no, in_at: newPosition }),
      });

      if (!response.ok) throw new Error('Failed to update token position');

      const result = await response.json();
      console.log(result);
      showSuccessAlert("Token position updated successfully");
    } catch (error) {
      showErrorAlert(error.message);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDragging) return;

    const { clientY } = e;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const scrollSpeed = 2; // Smaller value for slower scrolling
    const scrollMargin = 50;

    cancelAnimationFrame(scrollAnimationRef.current);

    const scrollHandler = () => {
      if (clientY - containerRect.top < scrollMargin) {
        container.scrollBy({ top: -scrollSpeed, behavior: 'smooth' });
      } else if (containerRect.bottom - clientY < scrollMargin) {
        container.scrollBy({ top: scrollSpeed, behavior: 'smooth' });
      }
      scrollAnimationRef.current = requestAnimationFrame(scrollHandler);
    };

    scrollAnimationRef.current = requestAnimationFrame(scrollHandler);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(scrollAnimationRef.current);
  }, []);

  return (
    <div className='missed_token_main'>
      <div className="logo_name">
        <h2>Waiting List</h2>
      </div>
      <div className="queue_list" ref={containerRef} onDragOver={handleDragOver}>
        {queue.map((item, index) => (
          <div
            key={item.token_no?.toString()}
            className={`draggable-item col-xl-10 col-lg-10 cursor-grab ${draggedItemIndex === index ? 'dragging cursor-grabbing' : ''} ${item.transition ? 'drop-transition' : ''}`}
            draggable
            onDrag={(e) => handleDrag(e)}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, index)}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="card l-bg-blue-dark">
              <div className="card-statistic-3 p-4">
                <div className="card-icon card-icon-large"><i className="fas fa-users" /></div>
                <div className="mb-4 d-flex">
                  <h5 className="card-title col-8 fs-4 mb-0 text-white">Waiting Customer</h5>
                  <div className="col-4">
                    <button onClick={() => handleSkipBtn(item.token_no)} className="btn btn-danger w-full">Skip</button>
                  </div>
                </div>
                <div className='d-flex w-full justify-content-between'>
                  <div className="d-flex flex-column w-full bg-red-900">
                    <h2 className="d-flex align-items-center text-white mb-0">
                      Token No. &nbsp;
                    </h2>
                    <h2 className="d-flex align-items-center text-white mb-0">
                      Customer Name &nbsp;
                    </h2>
                    <h2 className="d-flex align-items-center text-white mb-0">
                      Customer Mobile &nbsp;
                    </h2>
                  </div>
                  <div>
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TokenList;
