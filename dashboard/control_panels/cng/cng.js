// Mock Live Data for CNG Division Simulation

const transactions = [
    { time: "10:45 AM", vehicle: "Dhaka Metro GA-15", vol: "14.5", amount: "1,245 ৳", type: "Cash" },
    { time: "10:20 AM", vehicle: "Chatta Metro TA-11", vol: "32.0", amount: "2,800 ৳", type: "Credit" },
    { time: "10:12 AM", vehicle: "Dhaka Metro KHA-88", vol: "8.2", amount: "715 ৳", type: "Cash" },
    { time: "09:55 AM", vehicle: "Sylhet Metro CHA-41", vol: "21.6", amount: "1,890 ৳", type: "Cash" },
    { time: "09:30 AM", vehicle: "BRTC Bus-401", vol: "65.4", amount: "5,720 ৳", type: "Credit" }
];

document.addEventListener('DOMContentLoaded', () => {
    
    // Simulate loading data
    setTimeout(() => {
        document.getElementById('val-sales').innerText = "৳ 1,45,200";
        document.getElementById('val-due').innerText = "৳ 24,500";
    }, 500);

    const tbody = document.getElementById('sales-table');
    transactions.forEach(t => {
        const typeClass = t.type === "Cash" ? "s-cash" : "s-due";
        const row = `
            <tr>
                <td>${t.time}</td>
                <td style="font-weight:500;">${t.vehicle}</td>
                <td>${t.vol}</td>
                <td style="font-weight:600;">${t.amount}</td>
                <td><span class="status ${typeClass}">${t.type}</span></td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', row);
    });

});
