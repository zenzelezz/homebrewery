// Dialog box, for popups and modal blocking messages
import React from "react";
const { useRef, useEffect } = React;

function Dialog({ dismisskeys = [], closeText = 'Close', blocking = false, ...rest }) {
	const dialogRef = useRef(null);

	useEffect(()=>{
		if (dismisskeys.length !== 0) {
			blocking ? dialogRef.current?.showModal() : dialogRef.current?.show();
		}
	}, [dialogRef.current, dismisskeys]);

	const dismiss = () => {
		dismisskeys.forEach(key => {
			if (key) {
				localStorage.setItem(key, 'true');
			}
		});
		dialogRef.current?.close();
	};
	
	return (
		<dialog ref={dialogRef} onCancel={dismiss} {...rest}>
			{rest.children}
			<button className='dismiss' onClick={dismiss}>
				{closeText}
			</button>
		</dialog>
	);
};

export default Dialog;
