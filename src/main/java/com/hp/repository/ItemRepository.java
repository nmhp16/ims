package com.hp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hp.entity.Item;

import java.util.Optional;

/**
 * Repository interface for managing {@link Item} entities.
 * Extends JpaRepository to provide basic CRUD operations and custom query
 * methods.
 */
public interface ItemRepository extends JpaRepository<Item, Long> {

    /**
     * Finds an item by its name.
     * 
     * @param name The name of the item to find.
     * @return An Optional containing the item if found, otherwise an empty
     *         Optional.
     */
    Optional<Item> findByName(String name);

    java.util.List<Item> findByExpirationDateBefore(java.time.LocalDate date);
    
    // Find items where quantity is less than minQuantity. 
    // Since minQuantity is a field in the entity, we can't use a simple derived query for "less than minQuantity column".
    // We can use a custom query or just filter in service. 
    // But we can find by quantity less than a specific value.
    // For "Low Stock" based on each item's minQuantity, we need a custom query.
    @org.springframework.data.jpa.repository.Query("SELECT i FROM Item i WHERE i.quantity <= i.minQuantity")
    java.util.List<Item> findLowStockItems();

    java.util.List<Item> findByNameContainingIgnoreCase(String name);
}
