import React, { useEffect, useRef, useState } from 'react';
import MUIDataTable from 'mui-datatables';
import { Link, Navigate } from 'react-router-dom';
import { VscScreenFull } from 'react-icons/vsc';
import Cookies from "js-cookie";
import { Typography, CircularProgress } from "@mui/material";
import { showErrorAlert,showSuccessAlert,showWarningAlert } from '../../Toastify';
import '../../assets/css/DisplayQueue.css'

const ProductList = () => {
    const [tableData, setTableData] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // State for loading indicator
    const [error, setError] = useState(null); // State for error handling
    const [isFullScreen, setIsFullScreen] = useState(false);
    const tableRef = useRef(null);
    const [colorCustomer, setcolorCustomer] = useState([]);

    //#region fetch from customer type color and name 
    useEffect(()=>{
        const fetchCustomerColor = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/v1/get-customer-type', {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                });
                const result = await response.json();
                if (Array.isArray(result?.message)) {
                    setcolorCustomer(result?.message);
                } else {
                    console.error("Expected an array but got:", result?.message);
                    setcolorCustomer([]);
                }
            } catch (error) {
                showErrorAlert(error.message);
            }
        }
        fetchCustomerColor()
    }, [])

    //#endregion

    useEffect(() => {
        const fetchList = async () => {
            setIsLoading(true); // Show loading indicator
            setError(null); // Clear previous error

            try {
                const response = await fetch("http://localhost:8000/api/v1/getQueue", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                console.log(result);

                if (Array.isArray(result.message[0])) {
                    setTableData(result.message[0]);
                } else {
                    console.error("Expected an array but got:", result.message[0]);
                    setTableData([]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Error fetching data");
                setTableData([]);
            } finally {
                setIsLoading(false); // Hide loading indicator
            }
        };

        fetchList();
        const intervalId = setInterval(fetchList, 10000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const handleFullScreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullScreen(false);
            }
        };

        document.addEventListener("fullscreenchange", handleFullScreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
        document.addEventListener("mozfullscreenchange", handleFullScreenChange);
        document.addEventListener("msfullscreenchange", handleFullScreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullScreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullScreenChange);
            document.removeEventListener("mozfullscreenchange", handleFullScreenChange);
            document.removeEventListener("msfullscreenchange", handleFullScreenChange);
        };
    }, []);

    const toggleFullScreen = () => {
        if (!isFullScreen) {
            if (tableRef.current.requestFullscreen) {
                tableRef.current.requestFullscreen();
            } else if (tableRef.current.mozRequestFullScreen) {
                tableRef.current.mozRequestFullScreen();
            } else if (tableRef.current.webkitRequestFullscreen) {
                tableRef.current.webkitRequestFullscreen();
            } else if (tableRef.current.msRequestFullscreen) {
                tableRef.current.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
        setIsFullScreen(!isFullScreen);
    };

    useEffect(() => {
        if (!tableData || tableData.length === 0) {
            setIsLoading(true);
        } else {
            setIsLoading(false);
        }
    }, [tableData]);

    const columns = [
        {
            name: "customer_name",
            label: "Name",
            options: {
                sort: true,
                filter: true,
                customHeadRender: ({ label }) => (
                    <th style={{ textAlign: 'left', paddingLeft: "15px" }}>
                        <strong>{label}</strong>
                    </th>
                ),
                customBodyRender: (value, tableMeta) => {
                    const customer = tableData[tableMeta.rowIndex];
                    return (
                        <div className="d-flex justify-content-start align-items-center product-name">
                            <div className="d-flex flex-column">
                                <h6 className="text-left text-nowrap mb-0" style={{ color: customer.customer_type_text_color }}>{customer.customer_name}</h6>
                            </div>
                        </div>
                    );
                },
            }
        },
        {
            name: "customer_mobile",
            label: "Mobile",
            options: {
                sort: true,
                filter: true,
                customBodyRender: (value, tableMeta) => {
                    const customer = tableData[tableMeta.rowIndex];
                    return (
                        <h6 className="text-nowrap mb-0 text-center" style={{ color: customer.customer_type_text_color }}>{customer.customer_mobile}</h6>
                    );
                },
            }
        },
        {
            name: "no_of_person",
            label: "No Of Person",
            options: {
                sort: true,
                filter: true,
                customBodyRender: (value, tableMeta) => {
                    const customer = tableData[tableMeta.rowIndex];
                    return (
                        <h6 className="text-nowrap mb-0 text-center" style={{ color: customer.customer_type_text_color }}>{customer.no_of_person}</h6>
                    );
                },
            }
        },
        {
            name: "token_no",
            label: "Token Number",
            options: {
                sort: true,
                filter: true,
                customBodyRender: (value, tableMeta) => {
                    const customer = tableData[tableMeta.rowIndex];
                    return (
                        <h6 className=" text-nowrap text-3xl mb-0  text-center" style={{ color: customer.customer_type_text_color }}>{customer.token_no}</h6>
                    );
                },
            }
        },
        {
            name: "qr_b64",
            label: "QR Code",
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
                    const base64Image = customer.qr_b64;
                    return (
                        <div className="text-center" style={{ display: "flex", justifyContent: "center" }}>
                            <img src={base64Image} alt="QR Code" style={{ width: 64, height: 64 }} />
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
        responsive: 'standard', // Options are 'stacked', 'scrollFullHeight', 'scrollMaxHeight', 'standard'
        customRowRender: (data, dataIndex, rowIndex) => {
            const customer = tableData[rowIndex];
            const rowColor = customer.customer_type_color || "#fff"; // default to white if no color provided
            return (
                <tr key={rowIndex} style={{ backgroundColor: rowColor, margin: "5px 0" }}>
                    {data.map((cell, index) => (
                        <td key={index} style={{ padding: "8px", border: "1px solid #ccc" }}>{cell}</td>
                    ))}
                </tr>
            );
        }
    };

    const isAuthenticated = Cookies.get("token") !== undefined;

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <div>
            <div className="d-flex justify-content-end p-3">
                <div className="btn-group me-4" role="group">
                    <button className="btn btn-outline-primary" onClick={toggleFullScreen}>
                        <VscScreenFull className="icon" />
                    </button>
                </div>
                <div>
                    <Link to="/generate-token">
                        <button className="btn btn-primary">Create New Token</button>
                    </Link>
                </div>
            </div>
            <div ref={tableRef} className={`mui-datatables ${isFullScreen ? 'fullscreen' : ''}`}>
                {isLoading ? (
                    <div className="text-center">
                        <CircularProgress className='circular-progress'/>
                    </div>
                ) : error ? (
                    <div className="text-center text-danger">
                        {error}
                    </div>
                ) : (
                    <MUIDataTable
                        title={
                            <Typography variant="h5" style={{ fontWeight: 'bold', color: "#2a2a2a", textAlign: "left"  }}>
                                 <div className='colorT'>
                                {
                                    colorCustomer.map((item)=>{

                                       return (
                                        <div className="colortype">
                                        <h6 className='type'>{item.customer_type_name}</h6>
                                        <p style={{background: item.customer_type_color,  color:item.customer_type_text_color}}></p>
                                        </div>
                                       )
                                    })
                                }
                               </div>
                               <h5 className='var_live_queue'>Live Queue</h5>
                              
                            </Typography>
                        }
                        data={tableData}
                        columns={columns}
                        options={options}
                    />
                )}
            </div>
        </div>
    );
};

export default ProductList;
