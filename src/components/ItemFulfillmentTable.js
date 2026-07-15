import React, { useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import "../css/ItemFulfillmentTable.css";
/**
 * A functional React component that renders a table displaying item fulfillments.
 *
 * @param {Object[]} items - An array of item fulfillment data.
 * @param {Function} onItemSelect - A callback function that is invoked when an item row is clicked to view its details.
 * @param {string|null} selectedItem - The currently selected item's ID. Used for styling purposes to highlight the selected row.
 * @param {Function} onRefresh - A callback function that is invoked to refresh the list of items.
 *
 * @returns {JSX.Element} A table of item fulfillments or a message if no items are available.
 */
const ItemFulfillmentTable = ({
	items,
	onItemSelect,
	selectedItem,
	onRefresh,
}) => {
	const [offlineItems, setOfflineItems] = useState({});

	//function to handle when process offline is checked
	const handleOfflineChange = useCallback((itemId) => {
		setOfflineItems((prev) => ({
			...prev,
			[itemId]: !prev[itemId],
		}));
	}, []);

	const renderTableRows = useMemo(() => {
		//if no item fulfillments are found return null
		if (!items || items.length === 0) {
			return null;
		}

		return items.map((item) => (
			<tr
				key={item.id}
				className={selectedItem === item.id ? "selectedItem" : ""}
			>
				<td>{item.tranid}</td>
				<td>{item.createdfrom}</td>
				<td>{item.description}</td>
				<td>
					<label>
						<input
							type="checkbox"
							checked={offlineItems[item.id] || false}
							onChange={() => handleOfflineChange(item.id)} //when process offline is checked
						/>
						Process offline
					</label>
				</td>
				<td>
					<button
						onClick={
							() => onItemSelect(item.id, offlineItems[item.id] || false) //pass back item.id, offline id if checked
						}
					>
						View Details
					</button>
				</td>
			</tr>
		));
	}, [items, selectedItem, offlineItems, onItemSelect, handleOfflineChange]);

	// If items are not available, return a message indicating no available items.
	if (!items || items.length === 0) {
		return (
			<p>
				<strong>
					No Item fulfillments available. Please contact an Administrator.
				</strong>
			</p>
		);
	}

	//render table below starting with table header
	return (
		<div>
			<button className="refresh-button" onClick={onRefresh}>
				Refresh Items
			</button>
			<table>
				<thead>
					<tr>
						<th>Transaction ID</th>
						<th>Sales Order ID</th>
						<th>Name</th>
						<th>Process Offline</th>
						<th>Details</th>
					</tr>
				</thead>
				{/* Render table body */}
				<tbody>{renderTableRows}</tbody>
			</table>
		</div>
	);
};

// Type checking on items passed to ItemFulfillmentTable
ItemFulfillmentTable.propTypes = {
	// An array of a certain type [items]
	items: PropTypes.arrayOf(
		// An object taking on a particular shape
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			tranid: PropTypes.string.isRequired,
			createdfrom: PropTypes.string.isRequired,
			description: PropTypes.string.isRequired,
		})
	),
	onItemSelect: PropTypes.func.isRequired,
	selectedItem: PropTypes.string,
	onRefresh: PropTypes.func.isRequired,
};

ItemFulfillmentTable.defaultProps = {
	items: [],
};

export default React.memo(ItemFulfillmentTable);
