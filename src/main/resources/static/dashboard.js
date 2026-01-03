document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Display user info
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('userInfo').innerText = `Welcome, ${username}`;
    }

    loadStats();
    loadItems();
    loadAlerts();
    loadTransactions();
    
    // Search listener
    document.getElementById('searchInput').addEventListener('input', (e) => {
        loadItems(e.target.value);
    });

    // Low Stock Filter listener
    const lowStockFilter = document.getElementById('lowStockFilter');
    if (lowStockFilter) {
        lowStockFilter.addEventListener('change', () => {
            loadItems(document.getElementById('searchInput').value);
        });
    }

    // Add Item Form
    document.getElementById('addItemForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addItem();
    });

    // Edit Item Form
    const editForm = document.getElementById('editItemForm');
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            updateItem();
        });
    }
});

function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!options.headers) {
        options.headers = {};
    }
    options.headers['Authorization'] = 'Bearer ' + token;
    
    return fetch(url, options).then(res => {
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            window.location.href = 'login.html';
            throw new Error('Unauthorized');
        }
        return res;
    });
}

function loadStats() {
    authFetch('/items/stats')
        .then(res => res.json())
        .then(stats => {
            document.getElementById('statTotalItems').innerText = stats.totalItems;
            document.getElementById('statTotalValue').innerText = '$' + stats.totalValue.toFixed(2);
            document.getElementById('statLowStock').innerText = stats.lowStockCount;
            document.getElementById('statUnique').innerText = stats.uniqueProducts;
            
            // Update badge
            const alertCount = stats.lowStockCount; // + expiring count if we had it in stats
            const badge = document.getElementById('alertBadge');
            badge.innerText = alertCount;
            badge.style.display = alertCount > 0 ? 'inline-block' : 'none';
        })
        .catch(err => console.error('Error loading stats:', err));
}

let currentSort = { field: 'name', direction: 'asc' };

function sortItems(field) {
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = field;
        currentSort.direction = 'asc';
    }
    loadItems(document.getElementById('searchInput').value);
}

function loadItems(query = '') {
    const url = query ? `/items/search?query=${encodeURIComponent(query)}` : '/items';
    
    authFetch(url)
        .then(res => res.json())
        .then(items => {
            // Apply Low Stock Filter
            const lowStockFilter = document.getElementById('lowStockFilter');
            if (lowStockFilter && lowStockFilter.checked) {
                items = items.filter(item => item.quantity <= (item.minQuantity || 5));
            }

            // Apply Sorting
            items.sort((a, b) => {
                let valA = a[currentSort.field];
                let valB = b[currentSort.field];
                
                // Handle nulls
                if (valA === null || valA === undefined) valA = '';
                if (valB === null || valB === undefined) valB = '';

                // String comparison
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();

                if (valA < valB) return currentSort.direction === 'asc' ? -1 : 1;
                if (valA > valB) return currentSort.direction === 'asc' ? 1 : -1;
                return 0;
            });

            const tbody = document.getElementById('itemsTableBody');
            tbody.innerHTML = '';
            
            if (items.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No items found</td></tr>';
                return;
            }

            items.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><div class="fw-bold">${item.name}</div></td>
                    <td><span class="badge bg-secondary bg-opacity-10 text-secondary">${item.category || 'Uncategorized'}</span></td>
                    <td>
                        <span class="badge ${item.quantity <= (item.minQuantity || 5) ? 'bg-danger' : 'bg-success'}">
                            ${item.quantity}
                        </span>
                    </td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>${item.expirationDate || '-'}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-secondary" onclick="openEditModal('${item.name}')"><i class="bi bi-pencil"></i></button>
                            <button class="btn btn-outline-primary" onclick="openStockModal('${item.name}', 'IN')"><i class="bi bi-plus-lg"></i></button>
                            <button class="btn btn-outline-warning" onclick="openStockModal('${item.name}', 'OUT')"><i class="bi bi-dash-lg"></i></button>
                            <button class="btn btn-outline-danger" onclick="deleteItem('${item.name}')"><i class="bi bi-trash"></i></button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        });
}

function loadAlerts() {
    // Low Stock
    authFetch('/items/low-stock')
        .then(res => res.json())
        .then(items => {
            const div = document.getElementById('lowStockList');
            if (items.length === 0) {
                div.innerHTML = '<p class="text-muted small mb-0">No low stock items.</p>';
            } else {
                div.innerHTML = '<ul class="list-group list-group-flush small">' + 
                    items.map(i => `<li class="list-group-item px-0 d-flex justify-content-between align-items-center">
                        ${i.name}
                        <span class="badge bg-danger rounded-pill">${i.quantity} left</span>
                    </li>`).join('') + '</ul>';
            }
        });

    // Expiring
    authFetch('/items/expiring')
        .then(res => res.json())
        .then(items => {
            const div = document.getElementById('expiringList');
            if (items.length === 0) {
                div.innerHTML = '<p class="text-muted small mb-0">No items expiring soon.</p>';
            } else {
                div.innerHTML = '<ul class="list-group list-group-flush small">' + 
                    items.map(i => `<li class="list-group-item px-0 d-flex justify-content-between align-items-center">
                        ${i.name}
                        <span class="text-muted">${i.expirationDate}</span>
                    </li>`).join('') + '</ul>';
            }
        });
}

function loadTransactions() {
    authFetch('/transactions')
        .then(res => res.json())
        .then(txs => {
            const tbody = document.getElementById('transactionsTableBody');
            tbody.innerHTML = '';
            
            if (txs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No transactions yet</td></tr>';
                return;
            }

            txs.slice(0, 10).forEach(tx => {
                const tr = document.createElement('tr');
                const typeClass = tx.type === 'IN' ? 'text-success' : 'text-danger';
                const icon = tx.type === 'IN' ? 'bi-arrow-down-left' : 'bi-arrow-up-right';
                
                tr.innerHTML = `
                    <td>${new Date(tx.date).toLocaleString()}</td>
                    <td>${tx.itemName}</td>
                    <td><span class="${typeClass}"><i class="bi ${icon}"></i> ${tx.type}</span></td>
                    <td>${tx.quantity}</td>
                `;
                tbody.appendChild(tr);
            });
        });
}

function addItem() {
    const data = {
        name: document.getElementById('itemName').value,
        category: document.getElementById('itemCategory').value,
        price: parseFloat(document.getElementById('itemPrice').value),
        quantity: parseInt(document.getElementById('itemQuantity').value),
        minQuantity: parseInt(document.getElementById('itemMinQuantity').value),
        expirationDate: document.getElementById('itemExpiration').value || null
    };

    authFetch('/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => {
        if (res.ok) {
            bootstrap.Modal.getInstance(document.getElementById('addItemModal')).hide();
            document.getElementById('addItemForm').reset();
            refreshAll();
        } else {
            alert('Error adding item');
        }
    });
}

function openEditModal(name) {
    authFetch('/items/' + name)
        .then(res => res.json())
        .then(item => {
            document.getElementById('editItemOriginalName').value = item.name;
            document.getElementById('editItemName').value = item.name;
            document.getElementById('editItemCategory').value = item.category || '';
            document.getElementById('editItemPrice').value = item.price;
            document.getElementById('editItemMinQuantity').value = item.minQuantity || 5;
            document.getElementById('editItemExpiration').value = item.expirationDate || '';
            
            new bootstrap.Modal(document.getElementById('editItemModal')).show();
        })
        .catch(err => alert('Error loading item details'));
}

function updateItem() {
    const originalName = document.getElementById('editItemOriginalName').value;
    const data = {
        name: document.getElementById('editItemName').value,
        category: document.getElementById('editItemCategory').value,
        price: parseFloat(document.getElementById('editItemPrice').value),
        minQuantity: parseInt(document.getElementById('editItemMinQuantity').value),
        expirationDate: document.getElementById('editItemExpiration').value || null
    };

    authFetch('/items/' + originalName, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => {
        if (res.ok) {
            bootstrap.Modal.getInstance(document.getElementById('editItemModal')).hide();
            refreshAll();
        } else {
            alert('Error updating item');
        }
    });
}

function openStockModal(itemName, type) {
    document.getElementById('stockItemName').value = itemName;
    document.getElementById('stockType').value = type;
    document.getElementById('stockQuantity').value = 1;
    new bootstrap.Modal(document.getElementById('stockModal')).show();
}

function submitTransaction() {
    const itemName = document.getElementById('stockItemName').value;
    const type = document.getElementById('stockType').value;
    const quantity = parseInt(document.getElementById('stockQuantity').value);

    authFetch('/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemName, type, quantity })
    }).then(res => {
        if (res.ok) {
            bootstrap.Modal.getInstance(document.getElementById('stockModal')).hide();
            refreshAll();
        } else {
            res.text().then(msg => alert('Error: ' + msg));
        }
    });
}

function deleteItem(name) {
    if (confirm('Are you sure you want to delete ' + name + '?')) {
        authFetch('/items/' + name, { method: 'DELETE' })
            .then(res => {
                if (res.ok) refreshAll();
                else alert('Error deleting item');
            });
    }
}

function exportCsv() {
    const token = localStorage.getItem('token');
    fetch('/items/export', {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventory.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
    });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

function refreshAll() {
    loadStats();
    loadItems();
    loadAlerts();
    loadTransactions();
}
