package com.Chinmay.Hotel.order.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Chinmay.Hotel.order.entity.OrderItems;
import com.Chinmay.Hotel.order.entity.Orders;

public interface OrdersItemsRepository extends JpaRepository<OrderItems,Long> {

    Orders save(Orders order);
    
}