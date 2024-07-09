    // import React,{useState} from 'react'
    // import '../../../assets/css/ManageQueue.css'
    // import ManageQueue from '../ManageQueue';

    // const CallNextToken = () => {
    //     const [callNextToken, setCallNextToken] = useState([]);


    //     const handleNextBtn = async () => {
    //         try {
    //         const response = await fetch("http://localhost:8000/api/v1/call-next-token", {
    //             method: "GET",
    //             headers: {
    //             "Content-Type": "application/json",
    //             },
    //             credentials: "include",
    //         });
    //         if (!response.ok) {
    //             throw new Error('Failed to fetch data');
    //         }
    //         const result = await response.json();
    //         if (Array.isArray(result.message)) {
    //             setCallNextToken(result.message);
    //         }
    //         alert("Data fetched for the next token");
    //         } catch (error) {
    //         console.error('Error fetching data:', error);
    //         }
    //     }

        
    // return (
    //     <div>
    //             <div className="btn1" onClick={()=>handleNextBtn()}>
    //             Next
    //         </div>
    //         <ManageQueue token = {callNextToken} />
    //     </div>
    // )
    // }

    // export default CallNextToken