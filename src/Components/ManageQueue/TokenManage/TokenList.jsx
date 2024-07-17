import React, { useState, useEffect } from 'react';
import '../../../assets/css/ManageQueue.css';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TokenList = () => {
  const [queue, setQueue] = useState([]);
  const navigate = useNavigate();

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
      if (Array.isArray(result.message[0])) {
        setQueue(result.message[0]);
      } else {
        console.error("Expected an array but got:", result.message[0]);
        setQueue([]);
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [queue]); // Fetch queue only once when component mounts

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
      toast.success("Token skipped successfully");
      fetchQueue(); // Fetch the updated queue after skipping a token
      navigate('/manage-token-Queue');
    }
    catch (error) {
      console.log(error);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source } = result;

    // If there's no destination (dropped outside the list) or the position is unchanged
    if (!destination || (destination.index === source.index)) {
      return;
    }

    // Rearrange the items in the queue array
    const newQueue = Array.from(queue);
    const [movedItem] = newQueue.splice(source.index, 1);
    newQueue.splice(destination.index, 0, movedItem);

    setQueue(newQueue); // Update the queue state with the new order

    // Send the updated position to the backend
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
        throw new Error('Failed to update token position');
      }
      const result = await response.json();
      console.log(result);
      toast.success("Token position updated successfully");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='main_token_list_container'>
      <div className="Queue_manage">
        <h2>Queue List</h2>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="Queue_list">
          {(provided) => (
            <div className="queue_list" {...provided.droppableProps} ref={provided.innerRef}>
              {queue.map((item, index) => (
                <Draggable key={item.token_no} draggableId={item.token_no.toString()} index={index}>
                  {(provided) => (
                    <div
                      className="token_manage"
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                    >
                      <p>Queue no: <span>{item.token_no}</span></p>
                      <p>Name: <span>{item.customer_name}</span></p>
                      <p>Mobile: <span>{item.customer_mobile}</span></p>
                      <div className="btn_skip" onClick={() => handleSkipBtn(item.token_no)}>Skip</div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <ToastContainer />
    </div>
  );
};

export default TokenList;
