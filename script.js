// Jewelry Gallery Application
// Main JavaScript file for displaying jewelry items

// Sample jewelry data (will be loaded from localStorage or default data)
let jewelryData = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadJewelryData();
    renderGallery();
    setupFilters();
    setupModal();
});

// Load jewelry data from localStorage or use default data
function loadJewelryData() {
    // Default sample data with placeholder icons
    const defaultData = [
        {
            id: 1,
            name: "Golden Elegance Necklace",
            description: "A stunning golden necklace with intricate details, perfect for special occasions.",
            price: "$299",
            category: "necklace",
            image: "images/necklace.webp",
            likes: 0
        },
        {
            id: 2,
            name: "Diamond Stud Earrings",
            description: "Classic diamond stud earrings that add elegance to any outfit.",
            price: "$199",
            category: "earring",
            image: "images/earrings.webp",
            likes: 0
        },
        {
            id: 3,
            name: "Rose Gold Ring",
            description: "Elegant rose gold ring with a delicate design, perfect for everyday wear.",
            price: "$89",
            category: "ring",
            image: "images/ring.jpeg",
            likes: 0
        },        
        {
            id: 4,
            name: "Pearl Drop Necklace",
            description: "Timeless pearl drop necklace that never goes out of style.",
            price: "$249",
            category: "necklace",
            image: "images/pearlNecklace.webp",
            likes: 0
        }

    ];
    
    const savedData = localStorage.getItem('jewelryInventory');
    
    if (savedData) {
        jewelryData = JSON.parse(savedData);
        
        // Update existing items with default data if they match by ID
        // This ensures changes to default data are reflected
        defaultData.forEach(defaultItem => {
            const existingIndex = jewelryData.findIndex(item => item.id === defaultItem.id);
            if (existingIndex !== -1) {
                // Update existing item with default data, but preserve likes
                jewelryData[existingIndex] = {
                    ...defaultItem,
                    likes: jewelryData[existingIndex].likes || 0
                };
            }
        });
        
        // Save updated data
        saveJewelryData();
    } else {
        jewelryData = defaultData;
        saveJewelryData();
    }
}

// Save jewelry data to localStorage
function saveJewelryData() {
    localStorage.setItem('jewelryInventory', JSON.stringify(jewelryData));
}

// Render the gallery with jewelry items
function renderGallery(filterCategory = 'all') {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';

    const filteredData = filterCategory === 'all' 
        ? jewelryData 
        : jewelryData.filter(item => item.category === filterCategory);

    if (filteredData.length === 0) {
        gallery.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-gem"></i>
                <h3>No items found</h3>
                <p>Try selecting a different category or add items in the admin panel.</p>
            </div>
        `;
        return;
    }

    filteredData.forEach(item => {
        const itemElement = createJewelryItemElement(item);
        gallery.appendChild(itemElement);
    });
}

// Create a jewelry item card element
function createJewelryItemElement(item) {
    const div = document.createElement('div');
    div.className = 'jewelry-item';
    div.dataset.id = item.id;
    div.dataset.category = item.category;

    // Load likes from localStorage
    const likes = getLikes(item.id);

    div.innerHTML = `
        <div class="item-image" style="background: #fff; display: flex; align-items: center; justify-content: center; height: 280px;">
    <img src="${item.image}" alt="${item.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
</div>

        <div class="item-info">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <div class="item-price">${item.price}</div>
            <div class="item-actions">
                <button class="like-btn" data-id="${item.id}">
                    <i class="fas fa-heart"></i>
                    <span>${likes}</span>
                </button>
                <button class="share-btn" data-id="${item.id}">
                    <i class="fab fa-instagram"></i>
                </button>
            </div>
        </div>
    `;

    // Add click event to open modal
    div.addEventListener('click', function(e) {
        if (!e.target.closest('.like-btn') && !e.target.closest('.share-btn')) {
            openModal(item);
        }
    });

    // Add like button event
    const likeBtn = div.querySelector('.like-btn');
    likeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleLike(item.id);
    });

    // Add share button event
    const shareBtn = div.querySelector('.share-btn');
    shareBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        shareToInstagram(item);
    });

    // Check if item is liked
    if (isLiked(item.id)) {
        likeBtn.classList.add('liked');
    }

    return div;
}

// Setup filter buttons
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter gallery
            const filter = this.dataset.filter;
            renderGallery(filter);
        });
    });
}

// Setup modal functionality
function setupModal() {
    const modal = document.getElementById('imageModal');
    const closeBtn = document.querySelector('.close-modal');

    closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Open modal with item details
function openModal(item) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalPrice = document.getElementById('modalPrice');
    const modalLikeBtn = document.getElementById('modalLikeBtn');
    const modalLikeCount = document.getElementById('modalLikeCount');

    // FIXED: Real image support
    modalImage.src = item.image;
    modalImage.alt = item.name;
    modalImage.style.width = "100%";
    modalImage.style.height = "400px";
    modalImage.style.objectFit = "contain";
    modalImage.style.background = "#fff";

    modalTitle.textContent = item.name;
    modalDescription.textContent = item.description;
    modalPrice.textContent = item.price;

    const likes = getLikes(item.id);
    modalLikeCount.textContent = likes;

    if (isLiked(item.id)) {
        modalLikeBtn.classList.add('liked');
    } else {
        modalLikeBtn.classList.remove('liked');
    }

    modalLikeBtn.onclick = function () {
        toggleLike(item.id);
        modalLikeCount.textContent = getLikes(item.id);
        modalLikeBtn.classList.toggle('liked', isLiked(item.id));
    };

    // document.getElementById('shareInstagramBtn').onclick = function () {
    //     shareToInstagram(item);
    // };

    document.getElementById("shareInstagramBtn").onclick = function () {
        shareToInstagram(item);
    };
    

    modal.classList.add('show');
}


// Close modal
function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.classList.remove('show');
}

// Like/Unlike functionality
function toggleLike(itemId) {
    const likedItems = JSON.parse(localStorage.getItem('likedItems') || '[]');
    const index = likedItems.indexOf(itemId);

    if (index > -1) {
        likedItems.splice(index, 1);
    } else {
        likedItems.push(itemId);
    }

    localStorage.setItem('likedItems', JSON.stringify(likedItems));

    // Update likes count
    const likes = JSON.parse(localStorage.getItem('itemLikes') || '{}');
    if (index > -1) {
        likes[itemId] = Math.max(0, (likes[itemId] || 0) - 1);
    } else {
        likes[itemId] = (likes[itemId] || 0) + 1;
    }
    localStorage.setItem('itemLikes', JSON.stringify(likes));

    // Update UI
    renderGallery(document.querySelector('.filter-btn.active').dataset.filter);
}

// Check if item is liked
function isLiked(itemId) {
    const likedItems = JSON.parse(localStorage.getItem('likedItems') || '[]');
    return likedItems.includes(itemId);
}

// Get likes count for an item
function getLikes(itemId) {
    const likes = JSON.parse(localStorage.getItem('itemLikes') || '{}');
    return likes[itemId] || 0;
}

// Share to Instagram
function shareToInstagram(item) {
    const caption = `Check out this beautiful ${item.name} — ${item.price}\n\n${item.description}`;

    // Build correct public image URL for GitHub Pages
    const base = window.location.origin + window.location.pathname.replace("index.html", "");
    const imageURL = base + item.image;

    // Copy caption + image URL
    copyToClipboard(caption + "\n\n" + imageURL);

    // Mobile devices
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        const instagramUrl = "https://www.instagram.com/";
        
        // On mobile, navigate to Instagram (most reliable method)
        // Mobile browsers will prompt to open in app if installed
        window.location.href = instagramUrl;
        
        // Show alert with instructions (before navigation)
        alert("Caption + image link copied to clipboard!\n\nAfter Instagram opens:\n1. Create a new post\n2. Paste the copied text");
    } else {
        // Desktop
        alert("Caption + image link copied!\nOpen Instagram and paste it.");
        window.open("https://www.instagram.com/", "_blank");
    }
}

// Copy text to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

// Export function to refresh gallery (used by admin panel)
window.refreshGallery = function() {
    loadJewelryData();
    const activeFilter = document.querySelector('.filter-btn.active');
    renderGallery(activeFilter ? activeFilter.dataset.filter : 'all');
};

