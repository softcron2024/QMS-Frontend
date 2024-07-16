import React, { useState } from 'react';
import '../../assets/css/Customertype.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomerType = () => {
    const [type, setType] = useState({
        customer_type_name: "",
        customer_type_color: "",
        customer_type_text_color:"",
    });

    const handleChange = (e) => {
        setType({
            ...type,
            [e.target.name]: e.target.value
        });
    }

        //#region Add Customer Type
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/api/v1/add-customer-type', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(type),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            console.log(result)

            if (result.ResponseCode === 0) {
                toast.error(result.message);
                return;
            }

            if (result.message.ResponseCode === 1) {
                toast.success(result.message.ResponseMessage);
                setType({
                    customer_type_name: "",
                    customer_type_color: "",
                    customer_type_text_color:"",
                })
                return;
            }

        } catch (error) {
            toast.error('Error: ' + error.message);
            console.error('Error:', error.message);
        }
    };
    //#endregion


    

    return (
        <div className="filedset_form">
            <fieldset>
                <legend>Customer Type</legend>
                <form onSubmit={handleSubmit}>
                    <input onChange={handleChange} type="text" value={type.customer_type_name} name="customer_type_name"
                    placeholder='Customer Type Name' required />
                    <div className="Color_type">
                    <input onChange={handleChange} type="text" value={type.customer_type_color} name="customer_type_color"
                    placeholder='Customer Type Color' required />
                    <input onChange={handleChange} type="text" value={type.customer_type_text_color} name="customer_type_text_color"
                    placeholder='Customer Text Color' required />
                    </div>
                    <button type="submit" className='customer_type_btn'>Add Customer Type</button>
                </form>
            </fieldset>
            <ToastContainer />
        </div>
    );
}

export default CustomerType;
