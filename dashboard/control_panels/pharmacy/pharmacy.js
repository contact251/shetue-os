// Pharmacy Med Database Mock Logic

const medicines = [
    { name: "Napa Extend", category: "Tablet/Fever", stock: 1250, expiry: "12 Dec 2027", status: "In Stock" },
    { name: "Seclo 20mg", category: "Gastric", stock: 840, expiry: "05 Jun 2026", status: "In Stock" },
    { name: "Sergel 20mg", category: "Gastric", stock: 15, expiry: "10 Oct 2026", status: "Low Stock" },
    { name: "Fexo 120mg", category: "Allergy", stock: 210, expiry: "22 Apr 2026", status: "Near Expiry" },
    { name: "Azithromycin 500", category: "Antibiotic", stock: 45, expiry: "01 Jan 2028", status: "Low Stock" },
    { name: "Adryl Syrup", category: "Cough", stock: 65, expiry: "15 Jul 2027", status: "In Stock" }
];

document.addEventListener('DOMContentLoaded', () => {
    
    const tbody = document.getElementById('med-table');
    
    const renderTable = (data) => {
        tbody.innerHTML = '';
        data.forEach(m => {
            let sClass = "s-ok";
            if(m.status === "Low Stock") sClass = "s-low";
            if(m.status === "Near Expiry") sClass = "s-exp";

            const row = `
                <tr>
                    <td style="font-weight:600;">${m.name}</td>
                    <td>${m.category}</td>
                    <td>${m.stock} Units</td>
                    <td>${m.expiry}</td>
                    <td><span class="status ${sClass}">${m.status}</span></td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        });
    };

    renderTable(medicines);

    // Filter Logic
    document.getElementById('med-search').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = medicines.filter(m => m.name.toLowerCase().includes(term));
        renderTable(filtered);
    });
});
