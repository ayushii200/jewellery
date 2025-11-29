// Admin Panel JavaScript
// Handles adding, editing, and deleting jewelry items

let editingItemId = null;

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    loadInventory();
    setupAddForm();
});

// Load and display current inventory
function loadInventory() {
    const inventoryList = document.getElementById('inventoryList');
    const savedData = localStorage.getItem('jewelryInventory');
    
    if (!savedData || JSON.parse(savedData).length === 0) {
        inventoryList.innerHTML = `
            <div class="empty-inventory">
                <i class="fas fa-inbox"></i>
                <h3>No items in inventory</h3>
                <p>Add your first jewelry item using the form above!</p>
            </div>
        `;
        return;
    }

    const jewelryData = JSON.parse(savedData);
    inventoryList.innerHTML = '';

    jewelryData.forEach(item => {
        const itemElement = createInventoryItemElement(item);
        inventoryList.appendChild(itemElement);
    });
}

let uploadedImage = "";
document.getElementById('itemImage').addEventListener('change', function (event) {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {
        // This Base64 string is your image source
        uploadedImage = reader.result;
        console.log("Image loaded:", uploadedImage);
    };

    reader.readAsDataURL(file);
});


// Create inventory item element
function createInventoryItemElement(item) {
    const div = document.createElement('div');
    div.className = 'inventory-item';
    div.dataset.id = item.id;

    div.innerHTML = `
        <div class="inventory-item-image">
    <img src="${item.image}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: contain;">
</div>

        <div class="inventory-item-info">
            <h4>${item.name}</h4>
            <p>${item.description}</p>
            <div class="inventory-item-price">${item.price}</div>
            <span class="inventory-item-category">${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
        </div>
        <div class="inventory-item-actions">
            <button class="btn btn-danger" onclick="deleteItem(${item.id})">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;

    return div;
}

// Setup add item form
function setupAddForm() {
    const form = document.getElementById('addItemForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (editingItemId !== null) {
            updateItem(editingItemId);
        } else {
            addNewItem();
        }
    });
}

// Add new jewelry item
function addNewItem() {
    // jewelryData is already the global array loaded at startup, no need to load again

    // Get form values
    const name = document.getElementById('itemName').value.trim();
    const description = document.getElementById('itemDescription').value.trim();
    const price = document.getElementById('itemPrice').value.trim();
    const category = document.getElementById('itemCategory').value;

    // uploadedImage comes from file reader (base64)
    if (!uploadedImage) {
        alert('Please upload an image!');
        return;
    }

    // Validate
    if (!name || !description || !price || !category) {
        alert('Please fill in all fields!');
        return;
    }

    // Create new item
    const newId = jewelryData.length > 0 
        ? Math.max(...jewelryData.map(item => item.id)) + 1 
        : 1;

    const newItem = {
        id: newId,
        name: name,
        description: description,
        price: price,
        category: category,
        image: uploadedImage,   // ← USE IMAGE FROM FILE UPLOAD
        likes: 0
    };

    // Add to global array
    jewelryData.push(newItem);

    // Save updated data
    localStorage.setItem('jewelryInventory', JSON.stringify(jewelryData));

    // Reset form + image memory
    document.getElementById('addItemForm').reset();
    uploadedImage = "";

    loadInventory();
    showMessage('Item added successfully!', 'success');

    if (typeof window.refreshGallery === 'function') {
        window.refreshGallery();
    }
}


// Edit item
function editItem(itemId) {
    const savedData = localStorage.getItem('jewelryInventory');
    const jewelryData = JSON.parse(savedData);
    
    const item = jewelryData.find(i => i.id === itemId);
    
    if (!item) {
        alert('Item not found!');
        return;
    }

    editingItemId = itemId;

    // Fill form with item data
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemDescription').value = item.description;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemImage').value = item.image;

    // Change form button text
    const submitBtn = document.querySelector('#addItemForm button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Item';

    // Scroll to form
    document.querySelector('.admin-card').scrollIntoView({ behavior: 'smooth' });
}

// Update existing item
function updateItem(itemId) {
    const savedData = localStorage.getItem('jewelryInventory');
    const jewelryData = JSON.parse(savedData);
    
    const itemIndex = jewelryData.findIndex(i => i.id === itemId);
    
    if (itemIndex === -1) {
        alert('Item not found!');
        return;
    }

    // Get form values
    const name = document.getElementById('itemName').value.trim();
    const description = document.getElementById('itemDescription').value.trim();
    const price = document.getElementById('itemPrice').value.trim();
    const category = document.getElementById('itemCategory').value;
    const image = document.getElementById('itemImage').value.trim();

    // Validate
    if (!name || !description || !price || !category || !image) {
        alert('Please fill in all fields!');
        return;
    }

    // Update item
    jewelryData[itemIndex] = {
        ...jewelryData[itemIndex],
        name: name,
        description: description,
        price: price,
        category: category,
        image: image
    };

    localStorage.setItem('jewelryInventory', JSON.stringify(jewelryData));

    // Reset form and editing state
    document.getElementById('addItemForm').reset();
    editingItemId = null;
    
    // Reset button text
    const submitBtn = document.querySelector('#addItemForm button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Item';
    
    // Reload inventory
    loadInventory();
    
    // Show success message
    showMessage('Item updated successfully!', 'success');
    
    // Refresh gallery if on main page
    if (typeof window.refreshGallery === 'function') {
        window.refreshGallery();
    }
}

// Delete item
function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
        return;
    }

    const savedData = localStorage.getItem('jewelryInventory');
    const jewelryData = JSON.parse(savedData);
    
    const filteredData = jewelryData.filter(item => item.id !== itemId);
    
    localStorage.setItem('jewelryInventory', JSON.stringify(filteredData));
    
    // Reload inventory
    loadInventory();
    
    // Show success message
    showMessage('Item deleted successfully!', 'success');
    
    // Refresh gallery if on main page
    if (typeof window.refreshGallery === 'function') {
        window.refreshGallery();
    }
}

// Show message notification
function showMessage(message, type = 'info') {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    // Set background color based on type
    let bgColor = '#3498db'; // default blue
    if (type === 'success') bgColor = '#2ecc71';
    if (type === 'error') bgColor = '#e74c3c';
    
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s;
    `;

    document.body.appendChild(messageDiv);

    // Remove after 3 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// Export all data (inventory + likes) to a JSON file
function exportData() {
    try {
        // Get all data from localStorage
        const inventory = localStorage.getItem('jewelryInventory') || '[]';
        const likedItems = localStorage.getItem('likedItems') || '[]';
        const itemLikes = localStorage.getItem('itemLikes') || '{}';

        // Create export object
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            inventory: JSON.parse(inventory),
            likedItems: JSON.parse(likedItems),
            itemLikes: JSON.parse(itemLikes)
        };

        // Convert to JSON string
        const dataStr = JSON.stringify(exportData, null, 2);
        
        // Create download link
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `jewelry-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showMessage('Data exported successfully!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showMessage('Error exporting data. Please try again.', 'error');
    }
}

// Import data from a JSON file
function importData(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }

    if (!confirm('Importing data will replace all current inventory and likes. Continue?')) {
        event.target.value = ''; // Reset file input
        return;
    }

    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // Validate data structure
            if (!importedData.inventory || !Array.isArray(importedData.inventory)) {
                throw new Error('Invalid data format');
            }

            // Import data to localStorage
            localStorage.setItem('jewelryInventory', JSON.stringify(importedData.inventory));
            
            if (importedData.likedItems) {
                localStorage.setItem('likedItems', JSON.stringify(importedData.likedItems));
            } else {
                localStorage.setItem('likedItems', '[]');
            }
            
            if (importedData.itemLikes) {
                localStorage.setItem('itemLikes', JSON.stringify(importedData.itemLikes));
            } else {
                localStorage.setItem('itemLikes', '{}');
            }

            // Reload inventory
            loadInventory();
            
            // Refresh gallery if on main page
            if (typeof window.refreshGallery === 'function') {
                window.refreshGallery();
            }

            showMessage('Data imported successfully!', 'success');
        } catch (error) {
            console.error('Import error:', error);
            showMessage('Error importing data. Please check the file format.', 'error');
        }
        
        // Reset file input
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

// Clear all data
function clearAllData() {
    if (!confirm('Are you sure you want to clear ALL data? This includes inventory and all likes. This cannot be undone!')) {
        return;
    }

    if (!confirm('This is your last chance. Clear everything?')) {
        return;
    }

    localStorage.removeItem('jewelryInventory');
    localStorage.removeItem('likedItems');
    localStorage.setItem('itemLikes', '{}');

    // Reload inventory
    loadInventory();
    
    // Refresh gallery if on main page
    if (typeof window.refreshGallery === 'function') {
        window.refreshGallery();
    }

    showMessage('All data cleared successfully!', 'success');
}

// Add CSS animations if not already present
if (!document.getElementById('admin-animations')) {
    const style = document.createElement('style');
    style.id = 'admin-animations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

