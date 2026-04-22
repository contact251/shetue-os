// Data Configurations
const businessUnits = [
    { title: "CNG Division", desc: "Operations, capacity and station metrics.", icon: "ri-gas-station-line", color: "#f59e0b", status: "Live", link: "control_panels/cng/index.html" },
    { title: "LPG Distribution", desc: "Storage, tankers and safety metrics.", icon: "ri-fire-line", color: "#06b6d4", status: "Live", link: "control_panels/lpg/index.html" },
    { title: "Feed Mills", desc: "Inventory and supply chain management.", icon: "ri-plant-line", color: "#10b981", status: "In Dev", link: "control_panels/feed_mills/index.html" },
    { title: "Pharmacy & Health", desc: "Inventory and compliance control.", icon: "ri-capsule-line", color:  "#22c55e", status: "Active", link: "control_panels/pharmacy/index.html" },
    { title: "Shetue Tech", desc: "IT infrastructure, software and ISP.", icon: "ri-macbook-line", color: "#3b82f6", status: "In Dev", link: "control_panels/shetue_tech/index.html" },
    { title: "Engineering", desc: "Tender Tracking & Projects Vault.", icon: "ri-building-2-line", color: "#8b5cf6", status: "Live", link: "modules/engineering/index.html" }
];

const marketingAssets = [
    { title: "Pinterest Project", desc: "14 Creative promotion graphics.", icon: "ri-pinterest-line", color: "#e60023", status: "Local Assets", link: "file:///D:/pinterset%20%20project" },
    { title: "Amazon Roadmap", desc: "1 Crore Taka business strategy video.", icon: "ri-amazon-line", color: "#ff9900", status: "Internal Lab", link: "file:///D:/amazon%20business%20project" },
    { title: "Facebook Reels", desc: "Short video viral content batch.", icon: "ri-facebook-circle-line", color: "#1877f2", status: "Ready to Post", link: "file:///D:/facebook%20reels" }
];

const intelligenceTools = [
    { title: "ChatGPT", desc: "OpenAI language modeling and analysis.", icon: "ri-chat-voice-line", color: "#10a37f", link: "https://chat.openai.com" },
    { title: "Claude AI", desc: "Anthropic's advanced logic assistant.", icon: "ri-robot-2-line", color: "#d97757", link: "https://claude.ai" },
    { title: "Google Gemini", desc: "Multimodal AI ecosystem access.", icon: "ri-bard-line", color: "#1a73e8", link: "https://gemini.google.com" },
    { title: "Notion AI", desc: "Workspace intelligence and drafting.", icon: "ri-quill-pen-line", color: "#ffffff", link: "https://notion.so" }
];

const resourceTools = [
    { title: "Shetue Presentation Deck", desc: "Official professional pitch layout.", icon: "ri-presentation-fill", color: "#f59e0b", status: "Asset", link: "https://docs.google.com/presentation/d/1ZiBmKgkz3FjV9wYJvPb7pW6DQ5Xe4Zr2/edit?usp=sharing" },
    { title: "Project & Task Tracker", desc: "Master Notion-synced task board.", icon: "ri-list-check-3", color: "#10b981", status: "Live", link: "modules/project_tracker/index.html" },
    { title: "Zoho Books / ERP", desc: "Financial ledgers and automated sync.", icon: "ri-line-chart-line", color: "#0066ff", status: "Core System", link: "https://books.zoho.com" },
    { title: "Notion HQ", desc: "Master OS database and documentation.", icon: "ri-book-read-line", color: "#e2e8f0", status: "Core System", link: "https://notion.so" },
    { title: "Bitwarden Vault", desc: "Enterprise password and access control.", icon: "ri-shield-keyhole-line", color: "#175dce", status: "Secure", link: "https://bitwarden.com" },
    { title: "GitHub Repos", desc: "Source code and architecture versions.", icon: "ri-github-fill", color: "#a855f7", status: "Active", link: "https://github.com" },
    { title: "n8n Automations", desc: "Webhook orchestration and syncs.", icon: "ri-flow-chart", color: "#ea4335", status: "In Dev", link: "#" }
];

const socialMedia = [
    { title: "Facebook Page", desc: "Community engagement and ads.", icon: "ri-facebook-circle-fill", color: "#1877f2", link: "https://facebook.com" },
    { title: "LinkedIn", desc: "Corporate networking and hiring.", icon: "ri-linkedin-box-fill", color: "#0a66c2", link: "https://linkedin.com" },
    { title: "YouTube Channel", desc: "Video campaigns and content.", icon: "ri-youtube-fill", color: "#ff0000", link: "https://youtube.com" },
    { title: "WhatsApp Business", desc: "Automated alerts and support.", icon: "ri-whatsapp-line", color: "#25d366", link: "https://web.whatsapp.com" }
];

function renderGrid(containerId, dataArray) {
    const container = document.getElementById(containerId);
    if(!container) return;

    dataArray.forEach(item => {
        let statusBadge = "";
        if (item.status) {
            let sClass = "status-live";
            if(item.status.toLowerCase() === "active") sClass = "status-active";
            if(item.status.toLowerCase() === "in dev") sClass = "status-dev";
            statusBadge = `<span class="card-status ${sClass}">${item.status}</span>`;
        }

        const html = `
            <div class="element-card" style="--card-color: ${item.color}" onclick="handleLink('${item.link}')">
                <div class="card-icon">
                    <i class="${item.icon}"></i>
                </div>
                <h3 class="card-title">${item.title}</h3>
                <p class="card-desc">${item.desc}</p>
                <div class="card-footer">
                    ${statusBadge}
                    <i class="ri-arrow-right-line launch-icon"></i>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

// Intercept routing for UX consistency
window.handleLink = (url) => {
    if(url === '#') return;
    if(url.startsWith('http')) {
        window.open(url, '_blank');
    } else {
        // Since we are locally hosting standard files, an alert for local sub-pages if they aren't fully coded.
        console.log("Navigating to local module: " + url);
        window.location.href = url;
    }
}

// Clock updates
function updateClock() {
    const now = new Date();
    document.getElementById('os-clock').innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

document.addEventListener('DOMContentLoaded', () => {
    renderGrid('grid-business', businessUnits);
    renderGrid('grid-marketing', marketingAssets);
    renderGrid('grid-ai', intelligenceTools);
    renderGrid('grid-resources', resourceTools);
    renderGrid('grid-social', socialMedia);

    setInterval(updateClock, 1000);
    updateClock();
});
