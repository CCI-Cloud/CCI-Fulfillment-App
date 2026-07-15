import React, { useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import "../css/UploadCapture.css";

const MAX_FILE_SIZE =
	parseInt(process.env.REACT_APP_MAX_SIZE_UPLOAD_IMAGES) || 1048576; // 1MB in bytes

const UploadCapture = ({ onCapture, uploadedImages, imagesUploaded }) => {
	const [error, setError] = useState(null);
	const [uploadedFiles, setUploadedFiles] = useState([]);
	const maxUploadedFiles = useMemo(
		() => parseInt(process.env.REACT_APP_MAX_CAPTURED_IMAGES) || 3,
		[]
	);

	const handleFileUpload = useCallback(
		(event) => {
			const files = Array.from(event.target.files);

			// Check file size
			const oversizedFiles = files.filter((file) => file.size > MAX_FILE_SIZE);
			if (oversizedFiles.length > 0) {
				setError(
					`The following files exceed the 1MB size limit: ${oversizedFiles
						.map((f) => f.name)
						.join(", ")}`
				);
				return;
			}

			if (uploadedFiles.length + files.length > maxUploadedFiles) {
				setError(
					`You can only upload a maximum of ${maxUploadedFiles} images.`
				);
				return;
			}

			Promise.all(
				files.map(
					(file) =>
						new Promise((resolve, reject) => {
							const reader = new FileReader();
							reader.onloadend = () =>
								resolve({ file, preview: reader.result });
							reader.onerror = reject;
							reader.readAsDataURL(file);
						})
				)
			)
				.then((newFiles) => {
					setUploadedFiles((prev) => {
						const updatedFiles = [...prev, ...newFiles];
						onCapture(updatedFiles.map((f) => f.preview));
						return updatedFiles;
					});
					setError(null);
				})
				.catch(() => {
					setError(
						"An error occurred while processing the files. Please try again."
					);
				});
		},
		[onCapture, uploadedFiles, maxUploadedFiles]
	);

	const removeFile = useCallback(
		(index) => {
			if (!imagesUploaded) {
				setUploadedFiles((prev) => {
					const newFiles = prev.filter((_, i) => i !== index);
					onCapture(newFiles.map((f) => f.preview));
					return newFiles;
				});
			}
		},
		[imagesUploaded, onCapture]
	);

	const renderUploadButton = useMemo(
		() => (
			<div className="file-input-container">
				<input
					type="file"
					accept="image/*"
					multiple
					onChange={handleFileUpload}
					disabled={uploadedFiles.length >= maxUploadedFiles}
				/>
				<p>
					Upload Images {uploadedFiles.length}/{maxUploadedFiles} (Max 1MB per
					image)
				</p>
			</div>
		),
		[handleFileUpload, uploadedFiles.length, maxUploadedFiles]
	);

	const renderImages = useMemo(
		() => (
			<div className="uploaded-images">
				{(imagesUploaded ? uploadedImages : uploadedFiles).map((img, index) => (
					<div key={index} className="uploaded-image-container">
						<img
							src={imagesUploaded ? img : img.preview}
							alt={`Uploaded content ${index + 1}`}
							className="uploaded-image"
						/>
						{!imagesUploaded && (
							<button
								onClick={() => removeFile(index)}
								className="remove-button"
								aria-label="Remove image"
							>
								Remove
							</button>
						)}
					</div>
				))}
			</div>
		),
		[imagesUploaded, uploadedImages, uploadedFiles, removeFile]
	);

	return (
		<div className="upload-container">
			{error && (
				<p className="error-message" role="alert">
					{error}
				</p>
			)}
			<div className="upload-and-preview">
				{!imagesUploaded && renderUploadButton}
				{renderImages}
			</div>
			{uploadedFiles.length >= maxUploadedFiles && !imagesUploaded && (
				<p className="instruction-text">
					You've reached the maximum number of images. Remove an image to upload
					more.
				</p>
			)}
		</div>
	);
};

UploadCapture.propTypes = {
	onCapture: PropTypes.func.isRequired,
	uploadedImages: PropTypes.arrayOf(PropTypes.string),
	imagesUploaded: PropTypes.bool.isRequired,
};

UploadCapture.defaultProps = {
	uploadedImages: [],
};

export default UploadCapture;
