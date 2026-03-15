const filters = document.querySelectorAll("#checkmark")
let filterobjects = []
let allproducts = []

document.addEventListener("DOMContentLoaded", _ => {
    allProducts()
    
    filters.forEach(f => {
        f.addEventListener('click', _ => {
            const att = f.getAttribute('data-value')
            if(!filterobjects.includes(att)) {
                filterobjects.push(att)
                console.log(filterobjects)
            }
            else {
                filterobjects = filterobjects.filter(f => f !== att)
                console.log(filterobjects)
            }
            // * Hier Funktion für das Anzeigen der Produkte mit den Filtern aufrufen
            showProducts(filterobjects)
        })
    })
})

async function allProducts() {
    try {
        // * Hier die Logik für das Abrufen aller Produkte implementieren
        const req = await fetch("./scripts/products/products.json")
        const res = await req.json()
        console.log(res)
    } catch (error) {
        console.log(error)
    }
}

function showProducts(filterobjects) {
}