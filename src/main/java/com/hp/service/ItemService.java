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

    /**
     * Constructor for ItemService.
     * 
     * @param itemRepository The repository used for accessing and modifying items
     *                       in the database.
     */
    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    /**
     * Retrieves all items from the repository.
     * 
     * @return A list of all items.
     */
    public List<Item> getAllItems() {
        return itemRepository.findAll();
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
