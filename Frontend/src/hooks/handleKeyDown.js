const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
        const form = e.target.form;
        const index = Array.from(form.elements).indexOf(e.target);

        // Move to next element if it exists
        if (form.elements[index + 1]) {
            e.preventDefault();
            form.elements[index + 1].focus();
        }
    }
};
export default handleKeyDown;
