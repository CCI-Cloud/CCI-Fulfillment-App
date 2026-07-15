import React, {
	useRef,
	useState,
	forwardRef,
	useEffect,
	useCallback,
} from "react";
import PropTypes from "prop-types";
import SignatureCanvas from "react-signature-canvas";
import "../css/Signature.css";

/**
 * Signature Component
 *
 * This component provides a canvas for users to sign. It allows clearing the signature and
 * accepting it, sending the accepted signature to the parent component.
 *
 * @param {Object} props - The component's props.
 * @param {Function} props.onAccept - Callback function that receives the accepted signature as a data URL.
 * @param {Object} ref - The forwarded ref to expose certain methods to the parent.
 */
// const Signature = forwardRef((props, ref) => {
// 	const sigCanvas = useRef({}); // Reference to the signature canvas
const Signature = forwardRef(({ onAccept, onClear }, ref) => {
	const sigCanvas = useRef(null);
	const [isSigned, setIsSigned] = useState(false); // State to track if the canvas has a signature

	/**
	 * Sets the canvas dimensions based on the parent's width, considering padding and borders.
	 * Adjusts height depending on the screen width.
	 */
	const setCanvasDimensions = useCallback(() => {
		if (sigCanvas.current) {
			const canvas = sigCanvas.current.getCanvas();
			const parent = canvas.parentNode;

			const style = getComputedStyle(parent);
			const paddingX =
				parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
			const borderX =
				parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
			const elementWidth = parent.offsetWidth - paddingX - borderX;

			// Set width considering padding and border
			canvas.width = elementWidth;

			// Determine height based on screen width
			if (window.innerWidth <= 600) {
				canvas.height = 150;
			} else {
				canvas.height = elementWidth / 4; // Using the adjusted width to determine height
			}
		}
	}, []);

	/**
	 * Effect hook to initialize the canvas dimensions and attach an event listener for window resizing.
	 */
	useEffect(() => {
		setCanvasDimensions();
		window.addEventListener("resize", setCanvasDimensions);
		return () => {
			window.removeEventListener("resize", setCanvasDimensions);
		};
	}, [setCanvasDimensions]);

	const handleClear = useCallback(() => {
		if (sigCanvas.current) {
			sigCanvas.current.clear();
			setIsSigned(false);
			onClear();
		}
	}, [onClear]);

	const handleAccept = useCallback(() => {
		if (sigCanvas.current && isSigned) {
			const signatureDataUrl = sigCanvas.current
				.getTrimmedCanvas()
				.toDataURL("image/png");
			onAccept(signatureDataUrl);
		}
	}, [isSigned, onAccept]);

	const handleEnd = useCallback(() => {
		setIsSigned(true);
	}, []);

	// We're keeping useImperativeHandle for backwards compatibility
	// in case the parent component is still using ref.current.clear() or ref.current.accept()
	React.useImperativeHandle(ref, () => ({
		clear: handleClear,
		accept: handleAccept,
	}));

	return (
		<div className="signature-container">
			<SignatureCanvas
				ref={sigCanvas}
				canvasProps={{
					className: "signature-canvas",
				}}
				onEnd={handleEnd}
			/>
			<div className="button-container">
				<button onClick={handleClear}>Clear</button>
				<button onClick={handleAccept} disabled={!isSigned}>
					Accept Signature
				</button>
			</div>
		</div>
	);
});

// export default Signature;

Signature.propTypes = {
	onAccept: PropTypes.func.isRequired,
	onClear: PropTypes.func.isRequired,
};

export default React.memo(Signature);
