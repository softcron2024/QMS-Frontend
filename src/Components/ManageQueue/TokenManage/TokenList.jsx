import React, { useState, useEffect } from 'react';
import '../../../assets/css/ManageQueue.css';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';

const TokenList = () => {
  const [queue, setQueue] = useState([]);
  
  const navigate = useNavigate()
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
  }, [queue]);


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
        
        console.log(token_no);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        alert("token Skip Successfully")
        navigate('/manage-token-Queue')
    }
    catch(error){
      console.log(error);
    }
  };
  




  const onDragEnd = (result) => {
    const { destination, source } = result;

    // If there's no destination (dropped outside the list) or the position is unchanged
    if (!destination || (destination.index === source.index)) {
      return;
    }

    // Rearrange the items in the queue array
    const newQueue = Array.from(queue);
    const [movedItem] = newQueue.splice(source.index, 1);
    newQueue.splice(destination.index, 0, movedItem);

    setQueue(newQueue);
  };

  return (
    <div className="main_queue_container">
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
                      {/* <p>date: <span>2:00</span></p> */}
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
    </div>
  );
};

export default TokenList;
