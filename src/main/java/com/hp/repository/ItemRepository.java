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
}
