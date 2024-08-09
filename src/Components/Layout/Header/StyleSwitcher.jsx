import React from 'react';

const StyleSwitcher = () => {
    const handleClick = (event) => {
        event.preventDefault(); // Prevent default anchor behavior
        // Additional logic can be added here
    };

    return (
        // Style Switcher start
        <li className="nav-item dropdown-style-switcher dropdown me-2 me-xl-0">
            <a
                className="nav-link dropdown-toggle hide-arrow"
                href="#"
                onClick={handleClick}
                data-bs-toggle="dropdown"
            >
                <i className="ti ti-md ti-sun" />
            </a>
            <ul className="dropdown-menu dropdown-menu-end dropdown-styles">
                <li>
                    <button className="dropdown-item" onClick={handleClick} data-theme="light">
                        <span className="align-middle"><i className="ti ti-sun me-2" />Light</span>
                    </button>
                </li>
                <li>
                    <button className="dropdown-item" onClick={handleClick} data-theme="dark">
                        <span className="align-middle"><i className="ti ti-moon me-2" />Dark</span>
                    </button>
                </li>
                <li>
                    <button className="dropdown-item" onClick={handleClick} data-theme="system">
                        <span className="align-middle"><i className="ti ti-device-desktop me-2" />System</span>
                    </button>
                </li>
            </ul>
        </li>
        // Style Switcher end
    );
};

export default StyleSwitcher;
