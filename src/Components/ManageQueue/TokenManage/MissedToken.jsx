import React, { useState, useEffect } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { showErrorAlert, showSuccessAlert } from '../../../Toastify';
import '../../../assets/css/ManageQueue.css'

const MissedToken = () => {
  const [missed, setMissed] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [newPosition, setNewPosition] = useState('');

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
        body: JSON.stringify({ token_no: selectedToken, in_at: newPosition })
      });

      if (!response.ok) {
        throw new Error('Failed to recall token');
      }
      const result = await response.json();
      console.log(result);
      showSuccessAlert("Token Moved Successfully");
      setShowPopup(false);
      fetchQueue();
    } catch (error) {
      showErrorAlert(error.message);
    }
  };



  
  const onDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination || destination.index === source.index) {
      return;
    }

    const newQueue = Array.from(missed);
    const [movedItem] = newQueue.splice(source.index, 1);
    newQueue.splice(destination.index, 0, movedItem);
    setMissed(newQueue);
  };
  return (
    <div className='missed_token_queue_main'>
      <div className="logo_name">
        <h2>Missed Token List</h2>
      </div>
      <div className="queue_list">
      <DragDropContext onDragEnd={onDragEnd}>
  <Droppable droppableId={missed}>
    {(provided) => (
      <div className="queue" {...provided.droppableProps} ref={provided.innerRef}>
        {missed.map((item, index) => (
          <Draggable key={item.token_no.toString()} draggableId={item.token_no.toString()} index={index}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className="draggable-item"
              >
                <p>Queue No:<span>{item.token_no}</span></p>
                <p>Name:<span>{item.customer_name}</span></p>
                <p>Mobile:<span>{item.customer_mobile}</span></p>
                <div className='skip_btn' onClick={() => handleMoveBtn(item.token_no)}>Moved</div>
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>

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
  )
}

export default MissedToken