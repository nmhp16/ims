package com.hp.entity;

import javax.persistence.*;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents an item in the inventory.
 * This class maps to the "items" table in the database.
 */
@Entity
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @Min(value = 0, message = "Quantity cannot be negative")
    private int quantity;

    @Min(value = 0, message = "Price cannot be negative")
    private double price;

    private java.time.LocalDate expirationDate;

    @Min(value = 0, message = "Min Quantity cannot be negative")
    private int minQuantity;

    @NotBlank(message = "Category is required")
    private String category;

    @ElementCollection
    private List<String> tags = new ArrayList<>();

    // Default constructor
    public Item() {
    }

    // Constructor with parameters
    /**
     * Constructs a new Item with the specified details.
     * 
     * @param name     The name of the item.
     * @param quantity The quantity of the item.
     * @param price    The price of the item.
     * @param tags     A list of tags associated with the item.
     * @param expirationDate The expiration date of the item.
     * @param minQuantity The minimum quantity before alert.
     * @param category The category of the item.
     */
    public Item(String name, int quantity, double price, List<String> tags, java.time.LocalDate expirationDate, int minQuantity, String category) {
        this.name = name;
        this.quantity = quantity;
        this.price = price;
        this.tags = tags;
        this.expirationDate = expirationDate;
        this.minQuantity = minQuantity;
        this.category = category;
    }

    // Getters and setters

    public java.time.LocalDate getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(java.time.LocalDate expirationDate) {
        this.expirationDate = expirationDate;
    }

    public int getMinQuantity() {
        return minQuantity;
    }

    public void setMinQuantity(int minQuantity) {
        this.minQuantity = minQuantity;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    // Getters and setters

    /**
     * Returns the unique identifier of the item.
     * 
     * @return The id of the item.
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the unique identifier of the item.
     * 
     * @param id The id to set.
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Returns the name of the item.
     * 
     * @return The name of the item.
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the name of the item.
     * 
     * @param name The name to set.
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Returns the quantity of the item.
     * 
     * @return The quantity of the item.
     */
    public int getQuantity() {
        return quantity;
    }

    /**
     * Sets the quantity of the item.
     * 
     * @param quantity The quantity to set.
     */
    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    /**
     * Returns the price of the item.
     * 
     * @return The price of the item.
     */
    public double getPrice() {
        return price;
    }

    /**
     * Sets the price of the item.
     * 
     * @param price The price to set.
     */
    public void setPrice(double price) {
        this.price = price;
    }

    /**
     * Returns the list of tags associated with the item.
     * 
     * @return The list of tags.
     */
    public List<String> getTags() {
        return tags;
    }

    /**
     * Sets the list of tags associated with the item.
     * 
     * @param tags The list of tags to set.
     */
    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    @Override
    public String toString() {
        return "Item [id=" + id + ", name=" + name + ", quantity=" + quantity + ", tags=" + tags + ", price=" + price
                + "]";
    }
}
