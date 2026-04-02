document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const arttype =
        document.getElementById("arttype") ||
        document.getElementById("artType");
    const artnr = document.getElementById("artnr");
    const name = document.getElementById("name");
    const description = document.getElementById("description");
    const keywords = document.getElementById("keywords");
    const price = document.getElementById("price");
    const available =
        document.getElementById("available") ||
        document.getElementById("avaiable");
    const heroImageInput = document.getElementById("heroImage");
    const secondImage = document.getElementById("secondImage");
    const thirdImage = document.getElementById("thirdImage");

    if (!form || !heroImageInput) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const hasHeroImage =
            heroImageInput.files && heroImageInput.files.length > 0;
        if (!hasHeroImage) {
            console.log("Kein Bild hochgeladen (Foto 1 ist verpflichtend). ");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("arttype", arttype?.value || "");
            formData.append("artnr", artnr?.value || "");
            formData.append("name", name?.value || "");
            formData.append("description", description?.value || "");
            formData.append("price", price?.value || "");
            formData.append("keywords", keywords?.value || "");
            formData.append("available", available?.checked ? "true" : "false");

            formData.append("heroImage", heroImageInput.files[0]);
            if (secondImage?.files?.[0]) {
                formData.append("secondImage", secondImage.files[0]);
            }
            if (thirdImage?.files?.[0]) {
                formData.append("thirdImage", thirdImage.files[0]);
            }

            const req = await fetch(
                "http://localhost:3000/api/products/newProduct",
                {
                    method: "POST",
                    body: formData,
                },
            );

            const rawText = await req.text();
            let res;
            try {
                res = rawText ? JSON.parse(rawText) : null;
            } catch {
                console.error("Backend antwortet nicht mit JSON:", rawText);
            }

            if (!req.ok) {
                console.error("CreateProduct fehlgeschlagen:", req.status, res || rawText);
                return;
            }

            if (req.ok) {
                alert(
                    `Produkt ${arttype.value}${artnr.value} erfolgreich erstellt!`,
                );
            }
        } catch (error) {
            console.error("Frontend Fehler beim erstellen:", error);
        }
    });

    getTestImage();
});

async function getTestImage() {
    try {
        const req = await fetch("http://localhost:3000/api/products");
        const res = await req.json();
        const imgContainer = document.querySelector(".test-img-container");
        if (!imgContainer) return;

        imgContainer.innerHTML = "";

        res.products.forEach((p) => {
            if (!p?.heroImage) return;

            const imgTag = document.createElement("img");
            imgTag.src = `http://localhost:3000/uploads/products/${encodeURIComponent(
                p.heroImage
            )}`;
            imgTag.alt = p?.name ? `Produktbild: ${p.name}` : "Produktbild";
            imgTag.loading = "lazy";

            imgContainer.appendChild(imgTag);
        });
    } catch (error) {
        console.log(error)
    }
}