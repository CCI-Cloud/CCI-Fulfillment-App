import React, {
	useState,
	useCallback,
	useRef,
	useEffect,
	useMemo,
} from "react";
import PropTypes from "prop-types";
import CameraCapture from "./CameraCapture";
import UploadCapture from "./UploadCapture";
//! import Signature from "./Signature";
import SignatureHandler from "./SignatureHandler";
import axios from "axios";
import "../css/ItemFulfillment.css";

/**
 * ItemFulfillment Component
 *
 * This component handles the image capture and signature collection processes related to
 * an item fulfillment activity, and then uploads the images to a server.
 *
 * @param {Object} details - The details of the item fulfillment.
 * @param {Function} onRefresh - Callback to refresh the parent component or UI.
 * @param {Object} data - Additional data that may be used for server operations.
 */
const ItemFulfillment = ({ details, onRefresh, data, isOffline }) => {
	// const sigCanvas = useRef({});

	// State variables
	const [itemFulfillmentId, setItemFulfillmentId] = useState(null);
	const [itemFulfillmentRecordId, setItemFulfillmentRecordId] = useState(null);
	const [capturedImages, setCapturedImages] = useState([]);
	const [capturedName, setCapturedName] = useState("");
	const [signatureImage, setSignatureImage] = useState(null);
	const [signatureAccepted, setSignatureAccepted] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [uploadStatus, setUploadStatus] = useState(null);
	const [uploadedUrls, setUploadedUrls] = useState([]);
	const [errorMessage, setErrorMessage] = useState(null);
	const [showDetails, setShowDetails] = useState(true);
	const [isProcessItemButtonDisabled, setIsProcessItemButtonDisabled] =
		useState(false);
	const [updateItemFulfillmentResponse, setUpdateItemFulfillmentResponse] =
		useState(null);
	const [imagesUploaded, setImagesUploaded] = useState(false);

	// Server URI from environment variables
	const expressServerRootUri = process.env.REACT_APP_EXPRESS_SERVER_ROOT_URI;

	/**
	 * Convert a data URL to a Blob object.
	 *
	 * @param {string} dataURL - The data URL to convert.
	 * @returns {Blob} The resulting Blob object.
	 */
	const dataURLToBlob = useCallback((dataURL) => {
		const byteString = atob(dataURL.split(",")[1]);
		const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
		const ab = new ArrayBuffer(byteString.length);
		const ia = new Uint8Array(ab);
		for (let i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}
		return new Blob([ab], { type: mimeString });
	}, []);

	/**
	 * Handle the process of uploading images to the server.
	 */
	const handleUpload = useCallback(async () => {
		if (!signatureImage) {
			setErrorMessage("Please provide a signature before submitting.");
			return;
		}
		if (capturedImages.length === 0) {
			setErrorMessage("Please capture at least one image before submitting.");
			return;
		}

		if (
			signatureImage &&
			capturedImages.length > 0 &&
			capturedName.trim().length === 0
		) {
			setErrorMessage("Please enter signer name.");
			return;
		}

		try {
			setUploading(true);
			setErrorMessage(null);
			const formData = new FormData();

			const signatureBlob = dataURLToBlob(signatureImage);
			const signatureFile = `${itemFulfillmentId}_signature.png`;
			formData.append("files", signatureBlob, signatureFile);

			capturedImages.forEach((image, index) => {
				const capturedImageBlob = dataURLToBlob(image);
				const pictureFile = `${itemFulfillmentId}_picture_${index + 1}.png`;
				formData.append("files", capturedImageBlob, pictureFile);
			});

			const response = await axios.post(
				`${expressServerRootUri}/api/uploadToS3`,
				formData
			);
			if (response.status === 200 && response.data && response.data.urls) {
				setUploadStatus("Images uploaded successfully.");
				setUploadedUrls(response.data.urls);
				setImagesUploaded(true);
			} else {
				setUploadStatus("Failed to upload images.");
			}
		} catch (error) {
			setUploadStatus(`Upload error: ${error.message}`);
		} finally {
			setUploading(false);
		}
	}, [
		signatureImage,
		capturedImages,
		capturedName,
		itemFulfillmentId,
		expressServerRootUri,
		dataURLToBlob,
	]);

	const handleSignatureAccept = useCallback((imgSrc) => {
		setSignatureImage(imgSrc);
		setSignatureAccepted(true);
	}, []);

	const handleSignatureClear = useCallback(() => {
		setSignatureImage(null);
		setSignatureAccepted(false);
	}, []);

	//!NEW
	const handleImageCapture = useCallback((imageSrcs) => {
		setCapturedImages(imageSrcs);
	}, []);

	const handleDetailsAndRefresh = useCallback(() => {
		setShowDetails(false);
		onRefresh();
	}, [onRefresh]);

	/**
	 * Update the item fulfillment record on the server with the captured image
	 * and signature URLs.
	 */
	//TODO Add name to update
	const updateItemFulfillment = useCallback(async () => {
		setIsProcessItemButtonDisabled(true);
		try {
			console.log(uploadedUrls);
			// Filter the URLs based on naming convention
			const capturedImageUrls = uploadedUrls.filter((url) =>
				url.includes("picture")
			);
			console.log(capturedImageUrls);
			const signatureImageUrl = uploadedUrls.find((url) =>
				url.includes("signature")
			);
			console.log(signatureImageUrl);
			// Defining payload
			const payload = {
				data: data,
				id: itemFulfillmentRecordId,
				capturedImages: capturedImageUrls,
				signatureImage: signatureImageUrl,
				//* Addition
				signerName: capturedName,
				// *End Addition
			};

			const response = await axios.post(
				`${expressServerRootUri}/api/updateItemFulfillmentRecord`,
				payload
			);
			if (response.status === 200) {
				setUpdateItemFulfillmentResponse(
					response.data.message || "Successfully updated."
				);
			} else {
				setIsProcessItemButtonDisabled(true);
				setUpdateItemFulfillmentResponse("Error updating ItemFulfillment.");
			}
		} catch (error) {
			setIsProcessItemButtonDisabled(true);
			setUpdateItemFulfillmentResponse(`Error: ${error.message}`);
		}
	}, [
		uploadedUrls,
		data,
		itemFulfillmentRecordId,
		capturedName,
		expressServerRootUri,
	]);

	const fieldsToDisplay = useMemo(
		() => ["custbody1", "tranId", "tranDate", "orderType", "shipAddress"],
		[]
	);

	const fieldLabels = useMemo(
		() => ({
			custbody1: "Seller",
			tranId: "Transaction ID",
			tranDate: "Transaction Date",
			orderType: "Order Type",
			shipAddress: "Shipping Address",
		}),
		[]
	);

	useEffect(() => {
		if (details) {
			setItemFulfillmentId(details.tranId);
			setItemFulfillmentRecordId(details.id);
		}
	}, [details]);

	const CaptureComponent = useMemo(
		() => (isOffline ? UploadCapture : CameraCapture),
		[isOffline]
	);

	if (!showDetails || !details) {
		return null;
	}

	return (
		<div>
			<h2>Item Details:</h2>
			<div className="responsive-table-container">
				<table className="detailsTable">
					<tbody>
						{fieldsToDisplay.map(
							(field) =>
								details[field] !== undefined && (
									<tr key={field} className="item-fulfillment-row">
										<td>{fieldLabels[field] || field}</td>
										<td>{details[field]}</td>
									</tr>
								)
						)}
						<tr>
							<td colSpan="2">
								<h3>Signature:</h3>
								{!imagesUploaded ? (
									<SignatureHandler
										isOffline={isOffline}
										onAccept={handleSignatureAccept}
										onClear={handleSignatureClear}
									/>
								) : (
									<div className="signature-display-container">
										{uploadedUrls.find((url) => url.includes("signature")) && (
											<img
												src={uploadedUrls.find((url) =>
													url.includes("signature")
												)}
												alt="Uploaded Signature"
											/>
										)}
									</div>
								)}
							</td>
						</tr>
						<tr>
							<td colSpan="2">
								<label>Signer</label>
								<div className="signature-display-container">
									<input
										name="myInput"
										placeholder="N/A"
										type="text"
										value={capturedName}
										onChange={(event) => {
											setCapturedName(event.target.value);
										}}
										disabled={imagesUploaded}
									/>
								</div>
							</td>
						</tr>
						<tr>
							<td colSpan="2">
								<h3>{isOffline ? "Upload" : "Capture"} Images:</h3>
								<CaptureComponent
									onCapture={handleImageCapture}
									uploadedImages={uploadedUrls.filter((url) =>
										url.includes("picture")
									)}
									imagesUploaded={imagesUploaded}
								/>
							</td>
						</tr>
						<tr>
							<td colSpan="2">
								<div className="upload-section">
									<div className="button-container">
										<button
											onClick={handleUpload}
											disabled={uploading || imagesUploaded}
										>
											Save Images in Storage
										</button>
									</div>
									{uploading && <p>Uploading...</p>}
									{uploadStatus && <p>{uploadStatus}</p>}
									{uploadedUrls.length > 0 && (
										<div>
											<div>
												<h4>Uploaded Files:</h4>
												<ul>
													{uploadedUrls.map((url, index) => (
														<li key={index}>
															<a
																href={url}
																target="_blank"
																rel="noopener noreferrer"
															>
																{url}
															</a>
														</li>
													))}
												</ul>
											</div>
											<div className="button-container">
												<button
													onClick={updateItemFulfillment}
													disabled={isProcessItemButtonDisabled}
												>
													Process Item Fulfillment
												</button>
												{updateItemFulfillmentResponse && (
													<div>
														<p>
															<strong>{updateItemFulfillmentResponse}</strong>
														</p>
														{onRefresh && (
															<button onClick={handleDetailsAndRefresh}>
																Close Item Fulfillment and refresh list
															</button>
														)}
													</div>
												)}
											</div>
										</div>
									)}
									{errorMessage && (
										<p className="error-message">{errorMessage}</p>
									)}
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
};

// export default ItemFulfillment;

ItemFulfillment.propTypes = {
	details: PropTypes.shape({
		id: PropTypes.string.isRequired,
		tranId: PropTypes.string.isRequired,
		custbody1: PropTypes.string,
		tranDate: PropTypes.string,
		orderType: PropTypes.string,
		shipAddress: PropTypes.string,
	}),
	onRefresh: PropTypes.func.isRequired,
	data: PropTypes.object.isRequired,
	isOffline: PropTypes.bool.isRequired,
};

export default React.memo(ItemFulfillment);
