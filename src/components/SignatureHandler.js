import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import Signature from "./Signature";
import SignatureUpload from "./SignatureUpload";

const SignatureHandler = ({ isOffline, onAccept, onClear }) => {
	const [signatureImage, setSignatureImage] = useState(null);

	const handleAccept = useCallback(
		(imgSrc) => {
			setSignatureImage(imgSrc);
			onAccept(imgSrc);
		},
		[onAccept]
	);

	const handleClear = useCallback(() => {
		setSignatureImage(null);
		onClear();
	}, [onClear]);

	return (
		<div className="signature-handler">
			{/* if offline is true, use upload functionality else accept new signature */}
			{isOffline ? (
				<SignatureUpload onAccept={handleAccept} onClear={handleClear} />
			) : (
				<Signature onAccept={handleAccept} onClear={handleClear} />
			)}
			{signatureImage && (
				<div className="signature-preview">
					<img src={signatureImage} alt="Signature" />
				</div>
			)}
		</div>
	);
};

SignatureHandler.propTypes = {
	isOffline: PropTypes.bool.isRequired,
	onAccept: PropTypes.func.isRequired,
	onClear: PropTypes.func.isRequired,
};

export default React.memo(SignatureHandler);
