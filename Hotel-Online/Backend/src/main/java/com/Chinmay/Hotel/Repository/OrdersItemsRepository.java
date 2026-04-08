package com.Chinmay.Hotel.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Chinmay.Hotel.Entity.OrderItems;
import com.Chinmay.Hotel.Entity.Orders;

public interface OrdersItemsRepository extends JpaRepository<OrderItems,Long> {

    Orders save(Orders order);
    
}