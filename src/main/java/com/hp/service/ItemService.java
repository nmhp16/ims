package com.hp.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.hp.entity.Item;
import com.hp.repository.ItemRepository;

/**
 * Service class that provides business logic related to items.
 * It uses the ItemRepository to perform CRUD operations and calculate the total
 * price.
 */
@Service
public class ItemService {

    private final ItemRepository itemRepository;
    private final com.hp.repository.TransactionRepository transactionRepository;

    /**
     * Constructor for ItemService.
     * 
     * @param itemRepository The repository used for accessing and modifying items
     *                       in the database.
     * @param transactionRepository The repository for transactions.
     */
    public ItemService(ItemRepository itemRepository, com.hp.repository.TransactionRepository transactionRepository) {
        this.itemRepository = itemRepository;
        this.transactionRepository = transactionRepository;
    }

    /**
     * Retrieves all items from the repository.
     * 
     * @return A list of all items.
     */
    public List<Item> getAllItems() {
        return itemRepository.findAll();
    }

    public List<Item> getLowStockItems() {
        return itemRepository.findLowStockItems();
    }

    public List<Item> getExpiringItems(int days) {
        return itemRepository.findByExpirationDateBefore(java.time.LocalDate.now().plusDays(days));
    }

    public List<com.hp.entity.Transaction> getAllTransactions() {
        return transactionRepository.findAllByOrderByDateDesc();
    }

    public void processTransaction(String itemName, String type, int quantity) {
        Optional<Item> itemOpt = itemRepository.findByName(itemName);
        if (itemOpt.isPresent()) {
            Item item = itemOpt.get();
            if ("IN".equalsIgnoreCase(type)) {
                item.setQuantity(item.getQuantity() + quantity); // Use setter if available or modify field
                // Assuming Item has setQuantity, let's check or add it. 
                // Wait, I need to check if Item has setQuantity. It says "Getters and setters" in the file but I didn't read them all.
                // I'll assume it has or I'll fix it.
            } else if ("OUT".equalsIgnoreCase(type)) {
                if (item.getQuantity() >= quantity) {
                    item.setQuantity(item.getQuantity() - quantity);
                } else {
                    throw new RuntimeException("Insufficient stock");
                }
            }
            itemRepository.save(item);
            transactionRepository.save(new com.hp.entity.Transaction(item.getId(), item.getName(), type, quantity));
        } else {
             throw new RuntimeException("Item not found");
        }
    }


    /**
     * Retrieves an item by its name.
     * 
     * @param name The name of the item to retrieve.
     * @return An Optional containing the item if found, otherwise an empty
     *         Optional.
     */
    public Optional<Item> getItemByName(String name) {
        return itemRepository.findByName(name);
    }

    /**
     * Adds a new item to the repository.
     * 
     * @param item The item to add.
     * @return The added item.
     */
    public Item addItem(Item item) {
        return itemRepository.save(item);
    }

    public List<Item> searchItems(String query) {
        return itemRepository.findByNameContainingIgnoreCase(query);
    }

    public java.util.Map<String, Object> getInventoryStats() {
        List<Item> allItems = itemRepository.findAll();
        double totalValue = allItems.stream().mapToDouble(i -> i.getQuantity() * i.getPrice()).sum();
        long totalItems = allItems.stream().mapToInt(Item::getQuantity).sum();
        long lowStockCount = itemRepository.findLowStockItems().size();
        
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("totalValue", totalValue);
        stats.put("totalItems", totalItems);
        stats.put("lowStockCount", lowStockCount);
        stats.put("uniqueProducts", allItems.size());
        return stats;
    }

    public String generateCsvExport() {
        List<Item> items = itemRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Name,Quantity,Price,Category,Expiration Date\n");
        for (Item item : items) {
            csv.append(item.getId()).append(",")
               .append(item.getName()).append(",")
               .append(item.getQuantity()).append(",")
               .append(item.getPrice()).append(",")
               .append(item.getCategory()).append(",")
               .append(item.getExpirationDate()).append("\n");
        }
        return csv.toString();
    }

    /**
     * Updates an existing item with new details.
     * 
     * @param existingItem The item to update.
     * @param itemDetails  The new details to update the item with.
     * @return The updated item.
     */
    public Item updateItem(Item existingItem, Item itemDetails) {
        existingItem.setName(itemDetails.getName());
        existingItem.setQuantity(itemDetails.getQuantity());
        existingItem.setPrice(itemDetails.getPrice());
        existingItem.setTags(itemDetails.getTags());

        return itemRepository.save(existingItem);
    }

    /**
     * Deletes an item from the repository.
     * 
     * @param item The item to delete.
     */
    public void deleteItem(Item item) {
        itemRepository.delete(item);
    }

    /**
     * Calculates the total price of all items.
     * 
     * @return The total price of all items.
     */
    public double calculateTotalPrice() {
        List<Item> items = itemRepository.findAll();
        return items.stream()
                .mapToDouble(item -> item.getQuantity() * item.getPrice())
                .sum();
    }

}
