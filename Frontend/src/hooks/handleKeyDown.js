const handleKeyDown = (e) => {
    if (e.key === "Enter") {
        const form = e.target.form;
        if (!form) return;

        const elements = Array.from(form.elements).filter(
            (el) =>
                el.tagName !== "FIELDSET" &&
                !el.disabled &&
                el.type !== "hidden"
        );

        const index = elements.indexOf(e.target);

        if (index > -1 && index < elements.length - 1) {
            e.preventDefault();
            elements[index + 1].focus();
        }
    }
};

export default handleKeyDown;
