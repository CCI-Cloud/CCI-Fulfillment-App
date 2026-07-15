import React from "react";

/**
 * Pagination Component
 *
 * This component renders a simple pagination control with "Previous" and "Next" buttons.
 * It allows for navigation between pages and ensures that the user cannot navigate beyond the
 * first and last pages.
 *
 * @param {number} currentPage - The currently active page.
 * @param {Function} setCurrentPage - The function to update the current page.
 * @param {number} maxPages - The maximum number of pages available.
 */
const Pagination = ({ currentPage, setCurrentPage, maxPages }) => (
	<div style={{ marginTop: "5px" }}>
		{/* Button to navigate to the previous page. It's disabled if the current page is the first page. */}
		<button
			style={{ marginRight: "10px" }}
			onClick={() => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1))}
			disabled={currentPage === 1}
		>
			Previous
		</button>

		{/* Button to navigate to the next page. It's disabled if the current page is the last page. */}
		<button
			onClick={() =>
				setCurrentPage((prevPage) => Math.min(prevPage + 1, maxPages))
			}
			disabled={currentPage === maxPages}
		>
			Next
		</button>
	</div>
);

export default Pagination;
