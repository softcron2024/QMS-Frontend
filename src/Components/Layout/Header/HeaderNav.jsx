import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Form from 'react-bootstrap/Form';
import Offcanvas from 'react-bootstrap/Offcanvas';
import '../../../assets/css/Header.css';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import Dropdown from 'react-bootstrap/Dropdown';
import { FaBell, FaUserCircle, FaSearch, FaMoon, FaSun } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";

const NavbarComponent = () => {
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.body.classList.toggle('dark-mode', !darkMode);
    };

    const removeCookies = () => {
        Cookies.remove("token", { path: "/", domain: "localhost" });
        window.location.reload();
        navigate("/");
    };

    return (
        <Navbar expand="xl" className={`bg-white mb-3 ${darkMode ? 'navbar-dark bg-dark' : 'navbar-light'} Nav_navbar shadow-sm border`}>
            <Container fluid>
                <Form className="d-flex flex-column flex-sm-row align-items-center me-3 clas">
                    <div className="d-flex align-items-center"> {/* Wrapping in a div for alignment */}
                        <Form.Control
                            type="search"
                            placeholder="Search"
                            className="me-2 mb-2 mb-sm-0 btn_cont" // Adjust margin bottom for small devices
                            aria-label="Search"
                        />
                        <Button variant="outline-primary" className="ms-sm-2 btn_search"> {/* Adjusting margin to separate button */}
                            <FaSearch />
                        </Button>
                    </div>
                </Form>
                <Navbar.Toggle aria-controls="offcanvasNavbar-expand-xl" />
                <Navbar.Offcanvas
                    id="offcanvasNavbar-expand-xl"
                    aria-labelledby="offcanvasNavbarLabel-expand-xl"
                    placement="end"
                    className="d-xl-none"  // Only show offcanvas on small screens
                >
                    <Offcanvas.Header closeButton className='mb-4'>
                        <Offcanvas.Title id="offcanvasNavbarLabel-expand-xl font-bold">
                            <Link to='/dashboard'>Softcron Tecnology</Link>
                        </Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <Nav className="justify-content-end flex-grow-1 pe-3">
                            <Nav.Item className='nav_dashboard'>
                                <Link to='/dashboard' className='Link_token'>
                                    <i className="fa-solid fa-gauge-high" /> Dashboard
                                </Link>
                            </Nav.Item>
                            <div className='navbar_link_dropdown'>
                                <ul>
                                    <li className='Link_navbar'>
                                        <Link to='/generate-token' className='Link_token'>
                                            <i className="fa-solid fa-ticket" /> Generate Token
                                        </Link>
                                    </li>
                                    <li className='Link_navbar'>
                                        <Link to='/today-token' className='Link_token'>
                                            <i className="fa-solid fa-list" /> Today Token List
                                        </Link>
                                    </li>
                                    <li className='Link_navbar'>
                                        <Link to='/display-queue' className='Link_token'>
                                            <i className="fa-solid fa-display" /> Display Queue Token
                                        </Link>
                                    </li>
                                    <li className='Link_navbar'>
                                        <Link to='/cancel-token' className='Link_token'>
                                            <i className="fa-solid fa-ban" style={{ color: "#ff474c" }} /> Cancel Token
                                        </Link>
                                    </li>
                                    <li className='Link_navbar'>
                                        <Link to='/scan-token' className='Link_token'>
                                            <i className="fa-solid fa-qrcode" /> QR Scanner
                                        </Link>
                                    </li>
                                    <li className='Link_navbar'>
                                        <Link to='/customer-type' className='Link_token'>
                                            <i className="fa-solid fa-qrcode" /> Customer Type Master
                                        </Link>
                                    </li>
                                    <li className='Link_navbar'>
                                        <Link to='/manage-token-queue' className='Link_token'>
                                            <i className="fa-solid fa-qrcode" /> Manage Queue Token
                                        </Link>
                                    </li>
                                    <li onClick={removeCookies} style={{ cursor: "pointer" }} className="menu-link Link_navbar" data-i18n="Order">
                                        <i className="fa-solid fa-right-from-bracket" /> Logout
                                    </li>
                                </ul>
                            </div>
                            <Dropdown align="end" className='dropdown_profile'>
                                <Dropdown.Toggle id="dropdown-basic" className='mt-3 drop_profile'>
                                    Profile
                                    <FaUserCircle />
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item href="#/profile">Profile</Dropdown.Item>
                                    <Dropdown.Item href="#/settings">Settings</Dropdown.Item>
                                    <Dropdown.Item href="#/logout">
                                        <div onClick={removeCookies} style={{ cursor: "pointer" }} className="menu-link" data-i18n="Order">Logout</div>
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Nav>
                    </Offcanvas.Body>
                </Navbar.Offcanvas>
                <Nav className="d-none d-xl-flex ms-auto">
                    <Dropdown align="end">
                        <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                            <FaUserCircle />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item href="#/profile">Profile</Dropdown.Item>
                            <Dropdown.Item href="#/settings">Settings</Dropdown.Item>
                            <Dropdown.Item href="#/logout">
                                <div onClick={removeCookies} style={{ cursor: "pointer" }} className="menu-link" data-i18n="Order">Logout</div>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Nav>
            </Container>
        </Navbar >
    );
};

export default NavbarComponent;
