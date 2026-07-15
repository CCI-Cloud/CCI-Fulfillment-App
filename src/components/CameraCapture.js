import React, { useEffect, useState, useRef, useCallback } from "react";
import "../css/CameraCapture.css";

/**
 * CameraCapture Component
 *
 * This component provides a UI to start a camera, capture an image, and stop the camera.
 * It displays the captured image and alerts the user if there are any errors accessing the camera.
 *
 * @param {Function} onCapture - Callback function that receives the captured image as a data URL.
 */
const CameraCapture = ({ onCapture, uploadedImages, imagesUploaded }) => {
	const [error, setError] = useState(null); // State to manage any camera-related errors
	const [stream, setStream] = useState(null); // State to hold the camera stream
	//* const [imageSrc, setImageSrc] = useState(null); // State to keep the captured image data URL
	const [capturedImages, setCapturedImages] = useState([]);
	const [isCameraActive, setIsCameraActive] = useState(false);
	const videoRef = useRef(null); // Reference to the video element for camera preview
	const maxCapturedImages =
		parseInt(process.env.REACT_APP_MAX_CAPTURED_IMAGES) || 3;

	/**
	 * Asynchronously starts the camera and sets the stream to the video element.
	 */
	const startCamera = async () => {
		try {
			const constraints = {
				video: {
					facingMode: "environment", // Prefer rear camera on devices
				},
			};
			const newStream = await navigator.mediaDevices.getUserMedia(constraints);
			setStream(newStream);
			setIsCameraActive(true);
			setError(null);
		} catch (err) {
			setError(
				"Failed to access the camera. Ensure it's enabled and try again."
			);
		}
	};

	/**
	 * Stops the active camera stream.
	 */
	const stopCamera = () => {
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			setStream(null);
			setIsCameraActive(false);
		}
	};

	/**
	 * Captures the current frame from the camera stream, converts it to a data URL, and
	 * invokes the onCapture callback.
	 */
	const captureImage = useCallback(() => {
		if (capturedImages.length >= maxCapturedImages) {
			setError(
				`You've reached the maximum limit of ${maxCapturedImages} images.`
			);
			return;
		}
		try {
			const canvas = document.createElement("canvas");
			canvas.width = videoRef.current.videoWidth;
			canvas.height = videoRef.current.videoHeight;
			canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
			const imgSrc = canvas.toDataURL("image/png");

			//* setImageSrc(imgSrc); // Store captured image data URL
			// onCapture(imgSrc);

			//* Ensure to stop the camera after capture
			// stream.getTracks().forEach((track) => track.stop());
			// setStream(null);

			setCapturedImages((prev) => {
				const newImages = [...prev, imgSrc];
				onCapture(newImages);
				return newImages;
			});
		} catch (err) {
			setError("Failed to capture the image. Please try again.");
		}
	}, [onCapture, capturedImages, maxCapturedImages]);

	//!NEW
	const removeImage = (index) => {
		if (!imagesUploaded) {
			setCapturedImages((prev) => {
				const newImages = prev.filter((_, i) => i !== index);
				onCapture(newImages);
				return newImages;
			});
		}
	};

	/**
	 * Effect hook to manage the camera stream lifecycle.
	 * Assigns the stream to the video element when available and cleans up the stream on unmount.
	 */
	useEffect(() => {
		//* videoRef.current.srcObject = stream;
		if (videoRef.current && stream) {
			videoRef.current.srcObject = stream;
		}

		return () => {
			// Stop the camera stream when the component unmounts
			stream?.getTracks().forEach((track) => track.stop());
		};
	}, [stream]);

	return (
		<div className="camera-container">
			{error && <p className="error-message">{error}</p>}
			<div className="video-and-capture">
				{/* <video ref={videoRef} autoPlay></video>
				{imageSrc && (
					<img
						src={imageSrc}
						alt="Captured content"
						className="captured-image"
					/> */}
				{!imagesUploaded && isCameraActive && (
					<video ref={videoRef} autoPlay></video>
				)}
				<div className="captured-images">
					{(imagesUploaded ? uploadedImages : capturedImages).map(
						(img, index) => (
							<div key={index} className="captured-image-container">
								<img
									src={img}
									alt={`Captured content ${index + 1}`}
									className="captured-image"
								/>
								{!imagesUploaded && (
									<div className="button-container">
										<button onClick={() => removeImage(index)}>Remove</button>
									</div>
								)}
							</div>
						)
					)}
				</div>
			</div>
			{!imagesUploaded && (
				<div className="button-container">
					{/* <button className="start" onClick={startCamera} disabled={stream}>
					Start Camera
				</button>
				<button className="capture" onClick={captureImage} disabled={!stream}>
					Capture
				</button>
				<button className="stop" onClick={stopCamera} disabled={!stream}>
					Stop Camera
				</button> */}
					<button onClick={isCameraActive ? stopCamera : startCamera}>
						{isCameraActive ? "Stop Camera" : "Start Camera"}
					</button>
					<button
						onClick={captureImage}
						disabled={
							!isCameraActive || capturedImages.length >= maxCapturedImages
						}
					>
						Capture {capturedImages.length}/{maxCapturedImages}
					</button>
				</div>
			)}
			{/* {!stream && (
				<p className="instruction-text">
					Please start the camera to enable the capture button.
				</p>
			)} */}

			{!isCameraActive && !imagesUploaded && (
				<p className="instruction-text">
					Please start the camera to enable the capture button.
				</p>
			)}
			{capturedImages.length >= maxCapturedImages && !imagesUploaded && (
				<p className="instruction-text">
					You've reached the maximum number of images. Remove an image to
					capture more.
				</p>
			)}
		</div>
	);
};

export default CameraCapture;
