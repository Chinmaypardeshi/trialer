package com.Chinmay.Hotel.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Chinmay.Hotel.DTO.CreateOrderRequest;
import com.Chinmay.Hotel.DTO.OrderItemRequest;
import com.Chinmay.Hotel.Entity.*;
import com.Chinmay.Hotel.Enums.*;
import com.Chinmay.Hotel.Repository.*;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrdersRepository orderRepo;
    private final ShopsRepository shopsRepo;
    private final SystemUsersRepository usersRepo;
    private final MenuRepository menuRepo;

    @Transactional
    public Orders createOrder(CreateOrderRequest request){
        
        Shops shop = shopsRepo.findById(request.getShopId())
                .orElseThrow(() -> new RuntimeException("Shop not found"));
        
        SystemUsers user = usersRepo.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Orders order = new Orders();
        order.setShop(shop);
        order.setUser(user);
        order.setStatus(OrderStatus.ACTIVE);
        order.setOrderTime(LocalDateTime.now());

        BigDecimal totalAmount = BigDecimal.ZERO;

        for(OrderItemRequest itemReq : request.getItems()){
            Menu menu = menuRepo.findById(itemReq.getMenuId())
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
                
        OrderItems item = new OrderItems();
        item.setOrder(order);
        item.setMenuItem(menu);
        item.setQuantity(itemReq.getQuantity());
        item.setPriceAtPurchase(menu.getPrice());

        order.getOrderItems().add(item);

        BigDecimal itemTotal =
                menu.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        totalAmount = totalAmount.add(itemTotal);
        }

        order.setTotalAmount(totalAmount);
        return orderRepo.save(order);





    }
}
