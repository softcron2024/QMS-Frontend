import React, { useState, useEffect } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { showErrorAlert, showSuccessAlert } from '../../../Toastify';
import '../../../assets/css/ManageQueue.css';

const TokenList = () => {
  const [queue, setQueue] = useState([]);

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

    const intervalId = setInterval(fetchQueue, 10000);

    return () => clearInterval(intervalId);
  }, []);

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
      showErrorAlert(error);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source } = result;

    // Ensure there's a destination and the indices are different
    if (!destination || destination.index === source.index) {
      return;
    }

    console.log("Drag result:", result);
    console.log("Source index:", source.index);
    console.log("Destination index:", destination.index);

    // Clone the queue to avoid direct mutation
    const newQueue = Array.from(queue);
    const [movedItem] = newQueue.splice(source.index, 1);

    // Log the state before and after splicing
    console.log("Queue before splicing:", queue);
    newQueue.splice(destination.index, 1, movedItem);
    console.log("Queue after splicing:", newQueue);

    // Update the state and log the new state
    setQueue(newQueue);
    console.log("Updated queue state:", newQueue);

    try {
      const response = await fetch("http://localhost:8000/api/v1/adjust-token-position", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          token_no: movedItem.token_no,
          in_at: destination.index
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.log("Failed to update token position. Response:", errorBody);
        throw new Error('Failed to update token position');
      }

      const result = await response.json();
      console.log("Server response:", result);
      showSuccessAlert("Token position updated successfully");
    } catch (error) {
      console.log("Error:", error);
    }
  };



  // Additional function to log queue state
  const logQueueState = () => {
    console.log("Current queue state:", queue);
  };

  // Call this function at various points to inspect the queue state
  logQueueState();




  return (
    <div className='missed_token_main'>
      <div className="logo_name">
        <h2>Queue List</h2>
      </div>
      <div className="queue_list">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={queue[0]?.token_no?.toString()}>
            {(provided) => (
              <ul className="queue" {...provided.droppableProps} ref={provided.innerRef}>
                {queue.map((item, index) => (
                  <Draggable key={item.token_no.toString()} draggableId={item.token_no.toString()} index={index}>
                    {(provided) => (
                      <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <div className="draggable-item">
                          <p>Queue No: <span>{item.token_no}</span></p>
                          <p>Name: <span>{item.customer_name}</span></p>
                          <p>Mobile: <span>{item.customer_mobile}</span></p>
                          <div className="skip_btn" onClick={() => handleSkipBtn(item.token_no)}>Skip</div>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>

      </div>
    </div>
  );
};

export default TokenList;
