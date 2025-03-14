let editingItemName = ''; // Variable to keep track of the item being edited

/**
 * Loads the items list from the server and displays it in the page.
 * If query is provided, it will filter the items by name.
 * @param {string} [query] - The query to filter the items by name.
 */
function loadItems(query = '') {
    fetch('/items')
        .then(response => response.json())
        .then(items => {
            const filteredItems = items.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
            const itemListDiv = document.getElementById('itemList');
            if (filteredItems.length === 0) {
                itemListDiv.innerHTML = '<p>No items found.</p>'; // Display message if no items are found
                document.getElementById('totalPrice').textContent = '0.00'; // Reset total price
                return;
            }

            // Generate HTML for the items table
            let tableHtml = '<table><thead><tr><th>Name</th><th>Quantity</th><th>Price</th><th>Brand</th><th>Serial Number</th><th>Actions</th></tr></thead><tbody>';
            filteredItems.forEach(item => {
                tableHtml += `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.price.toFixed(2)}</td>
                        <td>${item.tags.find(tag => tag.startsWith('Brand:')).substring(6)}</td>
                        <td>${item.tags.find(tag => tag.startsWith('Serial:')).substring(8)}</td>
                        <td>
                            <button id="editButton" onclick="showEditForm('${item.name}', '${item.quantity}', '${item.price}', '${item.tags.find(tag => tag.startsWith('Brand:')).substring(6)}', '${item.tags.find(tag => tag.startsWith('Serial:')).substring(8)}')">Edit</button>
                            <button id="deleteButton" onclick="deleteItem('${item.name}')">Delete</button>
                        </td>
                    </tr>
                `;
            });
            tableHtml += '</tbody></table>';
            itemListDiv.innerHTML = tableHtml;
            loadTotalPrice(); // Load the total price of all items
        })
        .catch(error => {
            console.error('Error fetching items:', error); // Log error if fetching fails
            document.getElementById('itemList').innerHTML = '<p>Error loading items.</p>'; // Display error message
        });
}


/**
 * Handles the form submission for adding a new item.
 * Prevents the page from reloading and posts the item data to the server.
 * Reloads the items list and resets the form fields after adding.
 * Logs an error if adding fails.
 * @param {Event} event - The form submission event.
 */
function addItem(event) {
    event.preventDefault(); // Prevent form submission from reloading the page
    const name = document.getElementById('name').value;
    const quantity = document.getElementById('quantity').value;
    const price = document.getElementById('price').value;
    const brand = document.getElementById('brand').value;
    const serial = document.getElementById('serial').value;
    
    fetch('/items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            quantity: quantity,
            price: price,
            tags: [`Brand: ${brand}`, `Serial: ${serial}`]
        })
    })
    .then(response => response.json())
    .then(() => {
        loadItems(); // Reload items after adding
        document.getElementById('addItemForm').reset(); // Reset the form fields
    })
    .catch(error => {
        console.error('Error adding item:', error); // Log error if adding fails
    });
}


/**
 * Deletes an item by its name.
 * @param {string} name - The name of the item to delete.
 * @return {Promise<void>} A promise that resolves when the deletion is complete or rejects if there's an error.
 */
function deleteItem(name) {
    fetch(`/items/${name}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            loadItems(); // Reload items after deletion
        } else {
            console.error('Error deleting item:', response.statusText); // Log error if deletion fails
        }
    })
    .catch(error => {
        console.error('Error deleting item:', error); // Log error if deletion fails
    });
}


/**
 * Triggers the item list reload with the current search query.
 * It reads the value from the search input and calls the loadItems function with the query.
 */
function searchItems() {
    const query = document.getElementById('searchInput').value;
    loadItems(query); // Reload items with the search query
}


/**
 * Loads the total price of all items from the server and displays it in the page.
 * It uses the /items/total-price endpoint to fetch the total price and updates the
 * #totalPrice element with the result.
 * Logs an error if fetching the total price fails.
 */
function loadTotalPrice() {
    fetch('/items/total-price')
        .then(response => response.json())
        .then(totalPrice => {
            document.getElementById('totalPrice').textContent = totalPrice.toFixed(2); // Update total price display
        })
        .catch(error => {
            console.error('Error fetching total price:', error); // Log error if fetching fails
        });
}


/**
 * Shows the edit form with the given item details pre-filled.
 * @param {string} name - The name of the item to edit.
 * @param {number} quantity - The quantity of the item to edit.
 * @param {number} price - The price of the item to edit.
 * @param {string} brand - The brand of the item to edit.
 * @param {string} serial - The serial number of the item to edit.
 */
function showEditForm(name, quantity, price, brand, serial) {
    const editFormContainer = document.getElementById('editFormContainer');
    document.getElementById('editName').value = name;
    document.getElementById('editQuantity').value = quantity;
    document.getElementById('editPrice').value = price;
    document.getElementById('editBrand').value = brand.trim(); // Trim whitespace
    document.getElementById('editSerial').value = serial;
    editingItemName = name; // Set the item being edited
    editFormContainer.style.display = 'block'; // Show the edit form
}


/**
 * Hides the edit form and clears the item being edited.
 */
function cancelEdit() {
    document.getElementById('editFormContainer').style.display = 'none'; // Hide the edit form
}


/**
 * Handles the form submission for updating an item.
 * Prevents the page from reloading and updates the item with the new details.
 * Reloads the items list and hides the edit form after updating.
 * Logs an error if updating fails.
 * @param {Event} event - The form submission event.
 */
function updateItem(event) {
    event.preventDefault(); // Prevent form submission from reloading the page
    const newName = document.getElementById('editName').value;
    const newQuantity = document.getElementById('editQuantity').value;
    const newPrice = document.getElementById('editPrice').value;
    const newBrand = document.getElementById('editBrand').value;
    const newSerial = document.getElementById('editSerial').value;

    fetch(`/items/${editingItemName}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: newName || editingItemName,
            quantity: newQuantity || 0,
            price: newPrice || 0,
            tags: [`Brand: ${newBrand}`, `Serial: ${newSerial}`]
        })
    })
    .then(response => {
        if (response.ok) {
            loadItems(); // Reload items after updating
            cancelEdit(); // Hide the edit form
        } else {
            console.error('Error updating item:', response.statusText); // Log error if updating fails
        }
    })
    .catch(error => {
        console.error('Error updating item:', error); // Log error if updating fails
    });
}

// Initial setup: add event listeners and load items
document.getElementById('addItemForm').addEventListener('submit', addItem);
document.getElementById('editItemForm').addEventListener('submit', updateItem);
loadItems(); // Load items when the page loads