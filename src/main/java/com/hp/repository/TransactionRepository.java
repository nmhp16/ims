package com.hp.repository;

import com.hp.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByItemId(Long itemId);
    List<Transaction> findAllByOrderByDateDesc();
}
