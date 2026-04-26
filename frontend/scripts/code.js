document.addEventListener("DOMContentLoaded", () => {
    const createCodeButton = document.getElementById("createCode");
    const codeInput = document.getElementById("codeId");
    const codeValueInput = document.getElementById("codeValue");

    if (!createCodeButton || !codeInput || !codeValueInput) return;

    createCodeButton.addEventListener("click", async (_) => {
        try {
            let data = {
                code: codeInput.value,
                discount: parseFloat(codeValueInput.value) / 100,
            };
            console.log(data);
            // const req = await fetch('http://localhost:3000/api/code/createCode', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({ data })
            // });
        } catch (error) {
            alert("Code wurde nicht erstellt!");
        }
    });
});
