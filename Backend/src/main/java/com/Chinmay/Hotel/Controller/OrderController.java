package com.Chinmay.Hotel.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.Chinmay.Hotel.DTO.CreateOrderRequest;

import com.Chinmay.Hotel.Entity.Orders;
import com.Chinmay.Hotel.Service.OrderService;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Validated
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<Orders> createOrder(
        @Valid @RequestBody CreateOrderRequest request) {
            Orders order = orderService.createOrder(request);
            return new ResponseEntity<>(order, HttpStatus.CREATED);
        }
    
    
    
}
