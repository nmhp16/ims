package com.hp.controller;

import com.hp.entity.Item;
import com.hp.service.ItemService;

import javax.annotation.PostConstruct;
import javax.validation.Valid;
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
        if (itemService.getAllItems().isEmpty()) {
            itemService.addItem(new Item("Pen", 10, 2, List.of("Brand: Bic", "Serial: P12345"), java.time.LocalDate.now().plusDays(365), 5, "Stationery"));
            itemService.addItem(new Item("Notebook", 5, 3, List.of("Brand: Primary", "Serial: N67890"), java.time.LocalDate.now().plusDays(730), 10, "Stationery"));
            itemService.addItem(new Item("Milk", 3, 2.5, List.of("Brand: Dairy", "Serial: M11223"), java.time.LocalDate.now().plusDays(5), 5, "Groceries"));
            itemService.addItem(new Item("Bread", 2, 1.5, List.of("Brand: Bakery", "Serial: B44556"), java.time.LocalDate.now().plusDays(2), 3, "Groceries"));
        }
    }

    // http://localhost:8084
    // Direct user to items.html when they click on the link
    // @GetMapping("/")
    // public String home() {
    //    return "<h1> Welcome to the Smart Inventory System! </h1>" +
    //            "<br>" +
    //            "<span style='font-size: 20px;'>Please click on </span>" +
    //            "<a href='/login.html' style='font-size: 25px;'>Login</a>" +
    //            "<span style='font-size: 20px;'> to view the dashboard</span>";
    // }

    // http://localhost:8084/items
    // Retrieve a list of all items
    @GetMapping("/items")
    public List<Item> getAllItems() {
        return itemService.getAllItems();
    }

    @GetMapping("/items/low-stock")
    public List<Item> getLowStockItems() {
        return itemService.getLowStockItems();
    }

    @GetMapping("/items/search")
    public List<Item> searchItems(@RequestParam String query) {
        return itemService.searchItems(query);
    }

    @GetMapping("/items/stats")
    public java.util.Map<String, Object> getStats() {
        return itemService.getInventoryStats();
    }

    @GetMapping("/items/export")
    public ResponseEntity<String> exportCsv() {
        String csv = itemService.generateCsvExport();
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"inventory.csv\"")
                .contentType(org.springframework.http.MediaType.TEXT_PLAIN)
                .body(csv);
    }

    @GetMapping("/items/expiring")
    public List<Item> getExpiringItems(@RequestParam(defaultValue = "7") int days) {
        return itemService.getExpiringItems(days);
    }

    @GetMapping("/transactions")
    public List<com.hp.entity.Transaction> getAllTransactions() {
        return itemService.getAllTransactions();
    }

    @PostMapping("/transactions")
    public ResponseEntity<?> processTransaction(@RequestBody com.hp.entity.Transaction transaction) {
        try {
            itemService.processTransaction(transaction.getItemName(), transaction.getType(), transaction.getQuantity());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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
    public ResponseEntity<Item> addItem(@Valid @RequestBody Item item) {
        Item newItem = itemService.addItem(item);
        return new ResponseEntity<>(newItem, HttpStatus.CREATED);
    }

    // http://localhost:8084/items/{name}
    // Update an existing item
    @PutMapping("/items/{name}")
    public ResponseEntity<Item> updateItem(@PathVariable String name, @Valid @RequestBody Item itemDetails) {
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
