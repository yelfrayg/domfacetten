document.addEventListener("DOMContentLoaded", () => {
    const createCodeButton = document.getElementById("createCode");
    const codeInput = document.getElementById("codeId");
    const codeValueInput = document.getElementById("codeValue");
    const availableCheckbox = document.getElementById("available");

    if (!createCodeButton || !codeInput || !codeValueInput) return;

    createCodeButton.addEventListener("click", async (event) => {
        event.preventDefault();
        try {
            let data = {
                code: codeInput.value,
                discount: parseFloat(codeValueInput.value) / 100,
                available: availableCheckbox.checked
            };
            console.log(data);
            const req = await fetch('/api/discountManagement/createCode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data })
            });
            const res = await req.json();
            console.log(res)
            if(res.code === 500) {
                alert("Code existiert bereits!");
            }
        } catch (error) {
            alert("Code wurde nicht erstellt!");
        }
    });
});
