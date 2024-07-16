import React, { useEffect, useState } from 'react';
import '../../assets/css/Customertype.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MUIDataTable from 'mui-datatables';
import Typography from '@material-ui/core/Typography';
import Modal from 'react-modal';

const CustomerType = () => {
    const [tableData, setTableData] = useState([]);
    const [type, setType] = useState({
        customer_type_name: "",
        customer_type_color: "",
        customer_type_text_color: "",
        customer_type_priority: ""
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const [editType, setEditType] = useState({
        customer_type_name: "",
        customer_type_color: "",
        customer_type_text_color: "",
        customer_type_priority: ""
    });

    const handleChange = (e) => {
        setType({
            ...type,
            [e.target.name]: e.target.value
        });
    };

    const handleEditChange = (e) => {
        setEditType({
            ...editType,
            [e.target.name]: e.target.value
        });
    };

    const openEditModal = (customer) => {
        setEditType(customer);
        setIsEditMode(true);
    };

    const closeEditModal = () => {
        setIsEditMode(false);
        setEditType(null);
    };

    //#region Post API for Customer type name/color/text/position
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

            const result = await response.json();

            if (result.ResponseCode === 0) {
                toast.error(result.message);
                return;
            }

            if (result.message.ResponseCode === 0) {
                toast.error(result.message.ResponseMessage);
                return;
            }

            if (result.message.ResponseCode === 1) {
                toast.success(result.message.ResponseMessage);
                setType({
                    customer_type_name: "",
                    customer_type_color: "",
                    customer_type_text_color: "",
                    customer_type_priority: ""
                });
                fetchType();
            }

        } catch (error) {
            toast.error('Error: ' + error.message);
            console.error('Error:', error.message);
        }
    };
    //#endregion

    //#region Edit API for Customer type name
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:8000/api/v1/update-customer-type', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(editType),
            });

            const result = await response.json();

            console.log(result);

            if (result.ResponseCode === 0) {
                toast.warning(result.message)
            }

            if (result.message.ResponseCode === 0) {
                toast.warning(result.message.ResponseMessage)
            }

            if (result.message.ResponseCode === 1) {
                toast.success(result.message.ResponseMessage);
                fetchType();
                closeEditModal();
                setEditType({
                    customer_type_name: "",
                    customer_type_color: "",
                    customer_type_text_color: "",
                    customer_type_priority: ""
                })
            } else {
                toast.error(result.message);
            }

        } catch (error) {
            toast.error('Error: ' + error.message);
            console.error('Error:', error.message);
        }
    };
    //#endregion

    //#region Fetch for Customer Type id and name 
    const fetchType = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/v1/get-customer-type', {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
            });
            const result = await response.json();
            if (Array.isArray(result.message)) {
                setTableData(result.message);
            } else {
                console.error("Expected an array but got:", result.message);
                setTableData([]);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };
    //#endregion

    //#region Delete API for Customer type
    const handleDelete = async (customer_type_id) => {
        try {
            const response = await fetch('http://localhost:8000/api/v1/delete-customer-type', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ customer_type_id }),
            });
            const result = await response.json();
            if (result.message.ResponseCode === 1) {
                toast.success(result.message.ResponseMessage);
                fetchType();
            } else {
                toast.error(result.message.ResponseMessage);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchType();

    }, []);
    //#endregion

    //#region  Table For Customer type 
    const columns = [
        {
            name: "customer_type_name",
            label: "Customer Type Name",
            options: {
                sort: true,
                filter: true,
                customBodyRender: (value, tableMeta) => {
                    const customer = tableData[tableMeta.rowIndex];
                    return (
                        <h6 className="text-nowrap mb-0 text-center fw-bold">
                            {customer.customer_type_name}
                        </h6>
                    );
                },
            }
        },
        {
            name: "customer_type_color",
            label: "Customer Type Color",
            options: {
                sort: true,
                filter: true,
                customBodyRender: (value, tableMeta) => {
                    const customer = tableData[tableMeta.rowIndex];
                    return (
                        <h6 className="text-nowrap mb-0 text-center fw-bold" >
                            {customer.customer_type_color}
                        </h6>
                    );
                },
            }
        },
        {
            name: "customer_type_text_color",
            label: "Text Color",
            options: {
                sort: true,
                filter: true,
                customBodyRender: (value, tableMeta) => {
                    const customer = tableData[tableMeta.rowIndex];
                    return (
                        <h6 className="text-nowrap text-3xl mb-0 text-center fw-bold" >
                            {customer.customer_type_text_color}
                        </h6>
                    );
                },
            }
        },
        {
            name: "customer_type_priority",
            label: "Customer Type Priority",
            options: {
                sort: true,
                filter: true,
                customBodyRender: (value, tableMeta) => {
                    const customer = tableData[tableMeta.rowIndex];
                    return (
                        <h6 className="text-nowrap text-3xl mb-0 text-center fw-bold" >
                            {customer.customer_type_priority}
                        </h6>
                    );
                },
            }
        },
        {
            name: "",
            label: "Operations",
            options: {
                sort: false,
                filter: false,
                customHeadRender: ({ label }) => (
                    <th style={{ fontWeight: 'bold', textAlign: "center" }}>
                        {label}
                    </th>
                ),
                customBodyRender: (value, tableMeta) => {
                    const customer = tableData[tableMeta.rowIndex];
                    return (
                        <div className="text-center btn_type" style={{ display: "flex", justifyContent: "center" }}>
                            <button className='customer_type_btn' onClick={() => openEditModal(customer)}>Edit</button>
                            <button className='customer_type_btn' onClick={() => handleDelete(customer.customer_type_id)}>Delete</button>
                        </div>
                    );
                },
            }
        }
    ];

    const options = {
        selectableRows: 'none',
        search: true,
        sort: true,
        filter: true,
        responsive: 'standard'
    };
    //#endregion

    return (
        <div className="customer_type">
            <div className="fieldset_form">
                <fieldset>
                    <legend>Customer Type</legend>
                    <form onSubmit={handleSubmit}>
                        <input
                            onChange={handleChange}
                            type="text"
                            value={type.customer_type_name}
                            name="customer_type_name"
                            placeholder='Customer Type Name'
                            required
                        />
                        <div className="Color_type">
                            <input
                                onChange={handleChange}
                                type="text"
                                value={type.customer_type_color}
                                name="customer_type_color"
                                placeholder='Customer Type Color'
                                required
                            />
                            <input
                                onChange={handleChange}
                                type="text"
                                value={type.customer_type_text_color}
                                name="customer_type_text_color"
                                placeholder='Customer Text Color'
                                required
                            />
                            <input
                                onChange={handleChange}
                                type="text"
                                value={type.customer_type_priority}
                                name="customer_type_priority"
                                placeholder='Customer Priority'
                                required
                            />
                        </div>
                        <button type="submit" className='customer_type_btn'>Add Customer Type</button>
                    </form>
                </fieldset>
            </div>
            <div className="customer_type_table mt-3 w-78">
                <MUIDataTable
                    title={
                        <Typography variant="h5" style={{ fontWeight: 'bold', color: "#2a2a2a", textAlign: "left" }}>
                            Customer Type
                        </Typography>
                    }
                    data={tableData}
                    columns={columns}
                    options={options}
                />
            </div>
            <Modal
                isOpen={isEditMode}
                onRequestClose={closeEditModal}
                contentLabel="Edit Customer Type"
                ariaHideApp={false}
                className="modal_update"
            >
                <h2>Edit Customer Type</h2>
                <form onSubmit={handleEditSubmit}>
                    <input
                        onChange={handleEditChange}
                        type="text"
                        value={editType?.customer_type_name || ""}
                        name="customer_type_name"
                        placeholder='Customer Type Name'
                        required
                    />
                    <div className="color_type">
                        <input
                            onChange={handleEditChange}
                            type="text"
                            value={editType?.customer_type_color || ""}
                            name="customer_type_color"
                            placeholder='Customer Type color'
                            required
                        />
                        <input
                            onChange={handleEditChange}
                            type="text"
                            value={editType?.customer_type_text_color || ""}
                            name="customer_type_text_color"
                            placeholder='Customer Type Name'
                            required
                        />
                        <h5 style={{color:"red", marginTop:'-10PX', marginRight:"-10px"}}>*</h5>
                        <input
                            onChange={handleEditChange}
                            type="text"
                            value={editType?.customer_type_priority || ""}
                            name="customer_type_priority"
                            placeholder='Customer Type Priority'
                            required
                        />
                    </div>
                    <div className="btn_edit">
                        <button type="submit" className='customer_type_btn customer_edit'>Update Customer Type</button>
                        <button type="button" className='customer_type_btn customer_edit' onClick={closeEditModal}>Cancel</button>
                    </div>
                </form>
            </Modal>

            <ToastContainer />
        </div>
    );
};

export default CustomerType;
