// Header.js
import React from "react";
import "../css/Header.css";

/**
 * Header Component
 *
 * Represents the header section of the application. Displays the application title and
 * a logout link if the user is logged in.
 *
 * @param {Object} props - The component's props.
 * @param {boolean} props.isLoggedIn - Indicates whether the user is logged in.
 *
 * @returns {React.Element} Rendered header component.
 */
const Header = ({ isLoggedIn }) => {
	return (
		<header>
			<h1>CCI Fulfillment</h1>
			<nav>{isLoggedIn ? <a href="/logout">Logout</a> : null}</nav>
		</header>
	);
};

export default Header;
