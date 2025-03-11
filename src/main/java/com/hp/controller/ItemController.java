package com.hp.controller;

import com.hp.entity.Item;
import com.hp.service.ItemService;

import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/")
public class ItemController {

    private final ItemService itemService;

    // Constructor Injection
    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    // Insert initial data into the table in database
    @PostConstruct
    public void init() {
        itemService.addItem(new Item("Pen", 10, 2, List.of("Brand: Bic", "Serial: P12345")));
        itemService.addItem(new Item("Notebook", 5, 3, List.of("Brand: Primary", "Serial: N67890")));
        itemService.addItem(new Item("Desk", 3, 25, List.of("Brand: IKEA", "Serial: D11223")));
        itemService.addItem(new Item("TV", 2, 200, List.of("Brand: Samsung", "Serial: T44556")));
    }

    // http://localhost:8084
    // Direct user to items.html when they click on the link
    @GetMapping("/")
    public String home() {
        return "<h1> Welcome to the Item Management System! </h1>" +
                "<br>" +
                "<span style='font-size: 20px;'>Please click on </span>" +
                "<a href='/items.html' style='font-size: 25px;'>items</a>" +
                "<span style='font-size: 20px;'> to view the items list</span>";
    }

    // http://localhost:8084/items
    // Retrieve a list of all items
    @GetMapping("/items")
    public List<Item> getAllItems() {
        return itemService.getAllItems();
    }

    // http://localhost:8084/items/{name}
    // Retrieve an item by its name
    @GetMapping("/items/{name}")
    public ResponseEntity<Item> getItemByName(@PathVariable String name) {
        Optional<Item> item = itemService.getItemByName(name);

        if (item.isPresent()) {
            return new ResponseEntity<>(item.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // http://localhost:8084/items
    // Add a new item
    @PostMapping("/items")
    public ResponseEntity<Item> addItem(@RequestBody Item item) {
        Item newItem = itemService.addItem(item);
        return new ResponseEntity<>(newItem, HttpStatus.CREATED);
    }

    // http://localhost:8084/items/{name}
    // Update an existing item
    @PutMapping("/items/{name}")
    public ResponseEntity<Item> updateItem(@PathVariable String name, @RequestBody Item itemDetails) {
        Optional<Item> optionalItem = itemService.getItemByName(name);

        if (optionalItem.isPresent()) {
            Item existingItem = optionalItem.get();
            // Update the existing item with the new details
            Item updatedItem = itemService.updateItem(existingItem, itemDetails);
            return new ResponseEntity<>(updatedItem, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // http://localhost:8084/items/{name}
    // Delete an item by its name
    @DeleteMapping("/items/{name}")
    public ResponseEntity<Void> deleteItem(@PathVariable String name) {
        Optional<Item> optionalItem = itemService.getItemByName(name);

        if (optionalItem.isPresent()) {
            itemService.deleteItem(optionalItem.get());
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // http://localhost:8084/items/total-price
    // Retrieve the total price of all items
    @GetMapping("/items/total-price")
    public ResponseEntity<Double> getTotalPrice() {
        double totalPrice = itemService.calculateTotalPrice();
        return new ResponseEntity<>(totalPrice, HttpStatus.OK);
    }
}
