import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";

const MAX_FILE_SIZE =
	parseInt(process.env.REACT_APP_MAX_SIZE_UPLOAD_IMAGES) || 5242880; // 5MB in bytes

const SignatureUpload = ({ onAccept, onClear }) => {
	const [signatureFile, setSignatureFile] = useState(null);
	const [error, setError] = useState(null);

	const handleFileChange = useCallback(
		(event) => {
			const file = event.target.files[0];
			setError(null);

			if (file) {
				if (file.size > MAX_FILE_SIZE) {
					setError(
						"File size exceeds 5MB limit. Please choose a smaller file."
					);
					return;
				}

				if (!file.type.startsWith("image/")) {
					setError("Invalid file type. Please upload an image.");
					return;
				}

				const reader = new FileReader();
				reader.onload = (e) => {
					setSignatureFile(e.target.result);
					onAccept(e.target.result);
				};
				reader.onerror = () => {
					setError("Error reading file. Please try again.");
				};
				reader.readAsDataURL(file);
			}
		},
		[onAccept]
	);

	const handleClear = useCallback(() => {
		setSignatureFile(null);
		setError(null);
		onClear();
	}, [onClear]);

	return (
		<div className="signature-upload">
			<input
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				className="signature-file-input"
			/>
			{error && <p className="error-message">{error}</p>}
			{signatureFile && (
				<div className="signature-preview">
					<img src={signatureFile} alt="Signature Preview" />
					<div className="button-container">
						<button onClick={handleClear} className="clear-button">
							Clear
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

SignatureUpload.propTypes = {
	onAccept: PropTypes.func.isRequired,
	onClear: PropTypes.func.isRequired,
};

export default React.memo(SignatureUpload);
