import React, { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { MyContext } from '../../ContextApi/ContextApi'; // Adjust the path based on your structure
import { showErrorAlert, showSuccessAlert } from '../../../Toastify';
import 'react-toastify/dist/ReactToastify.css';

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

    const newMissed = Array.from(missed);
    const [movedItem] = newMissed.splice(source.index, 1);
    newMissed.splice(destination.index, 0, movedItem);
    setMissed(newMissed);
  };

  return (
    <MyContext.Provider value={{ missed, setMissed, handleMoveBtn }}>
      <div className="Queue_manage">
        <h2>Missed Token</h2>
      </div>
        <DragDropContext onDragEnd={onDragEnd}>
          {missed.map((item, index) => (
            <Droppable droppableId={item?.token_no}>
              {(provided) => (
                <div className="queue_list" {...provided.droppableProps} ref={provided.innerRef}>

                  <Draggable key={item?.token_no} draggableId="queue_list" index={index}>
                    {(provided) => (
                      <div
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                      >
                        <p>Queue no: <span>{item?.token_no}</span></p>
                        <p>Name: <span>{item?.customer_name}</span></p>
                        <p>Mobile: <span>{item?.customer_mobile}</span></p>
                        <div className="btn_skip" onClick={() => handleMoveBtn(item?.token_no)}>Recall</div>
                      </div>
                    )}
                  </Draggable>

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      
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
    </MyContext.Provider>
  );
};

export default MissedToken;
