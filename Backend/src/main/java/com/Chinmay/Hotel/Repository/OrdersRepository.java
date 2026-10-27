package com.Chinmay.Hotel.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.Chinmay.Hotel.DTO.Admin.AdminRevenueDTO;
import com.Chinmay.Hotel.DTO.Admin.TopGroupDTO;
import com.Chinmay.Hotel.DTO.Admin.TopMenuItemDTO;
import com.Chinmay.Hotel.Entity.Orders;
import com.Chinmay.Hotel.Enums.OrderStatus;

@Repository
public interface OrdersRepository extends JpaRepository<Orders, Long> {
    
    //Fetch all ACTIVE orders for admin
    List<Orders> findByStatusOrderByOrderTimeAsc(OrderStatus status);


    // Daily Revenue Calculation
    @Query("""
        SELECT new com.Chinmay.Hotel.DTO.Admin.AdminRevenueDTO(
            :fromDate,
            :toDate, 
            COUNT(o),
            COALESCE(SUM(o.totalAmount),0)
    )
        FROM Orders o
        WHERE o.status = :status
        AND o.orderTime BETWEEN :start AND :end
            """)
    AdminRevenueDTO calculateDailyRevenue(
        @Param("status") OrderStatus status,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate
    );


    // Weekly Revenue Calculation
    @Query("""
        SELECT new com.Chinmay.Hotel.DTO.Admin.AdminRevenueDTO(
            :startDate,
            :endDate,
            COUNT(o),
            COALESCE(SUM(o.totalAmount), 0)
    )
        FROM Orders o
        WHERE o.status = :status
        AND o.paymentTime BETWEEN :start AND :end
        """)

    AdminRevenueDTO calculateWeeklyRevenue(
        @Param("status") OrderStatus status,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );


    // Monthly Revenue Calculation
    @Query("""
        SELECT new com.Chinmay.Hotel.DTO.Admin.AdminRevenueDTO(
            :startDate,
            :endDate,
            COUNT(o),
            COALESCE(SUM(o.totalAmount), 0)
    )
        FROM Orders o
        WHERE o.status = :status
        AND o.paymentTime BETWEEN :start AND :end   
        """)

    AdminRevenueDTO calculateMonthlyRevenue(
        @Param("status") OrderStatus status,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

            
    // Yearly Revenue Calculation
    @Query("""
        SELECT new com.Chinmay.Hotel.DTO.Admin.AdminRevenueDTO(
            :startDate,
            :endDate,
            COUNT(o),
            COALESCE(SUM(o.totalAmount),0)
    )
        FROM Orders o 
        WHERE o.status = :status
        AND o.paymentTime BETWEEN :start AND :end
        """)

    AdminRevenueDTO calculateYearlyRevenue(
        @Param("status") OrderStatus status,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );

    // Custom Revenue Calculation
    @Query("""
        SELECT new com.Chinmay.Hotel.DTO.Admin.AdminRevenueDTO(
            :fromDate,
            :toDate,
            COUNT(o),
            COALESCE(SUM(o.totalAmount), 0)
    )
        FROM Orders o
        WHERE o.status = :status
        AND o.paymentTime BETWEEN :start AND :end
    """)
    
    AdminRevenueDTO calculateCustomRevenue(
        @Param("status") OrderStatus status,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate
    );

    //Excel Export 
    @Query("""
    SELECT o
    FROM Orders o
    WHERE o.status = :status
    AND o.paymentTime BETWEEN :start AND :end
    ORDER BY o.paymentTime ASC
        """)
    List<Orders> findPaidOrdersForExcel(
        @Param("status") OrderStatus status,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );


    //PDF Export
    List<Orders> findByStatusAndPaymentTimeBetweenOrderByPaymentTimeAsc(
    OrderStatus status,
    LocalDateTime start,
    LocalDateTime end
    );

    @Query("""
        SELECT new com.Chinmay.Hotel.DTO.Admin.AdminRevenueDTO(
            :fromDate,
            :toDate,
            COUNT(o),
            COALESCE(SUM(o.totalAmount), 0)
    )
        FROM Orders o
        WHERE o.status = :status
        AND o.paymentTime BETWEEN :start AND :end
    """)
    AdminRevenueDTO calculateRevenueBetween(
        @Param("status") OrderStatus status,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end,
        @Param("fromDate") LocalDate fromDate,
        @Param("toDate") LocalDate toDate
    );


    //Admin Dashboard Query

    //1. Count Orders By status
    @Query("""
            SELECT COUNT(o)
            FROM Orders o
            WHERE o.status = :status
            AND o.orderTime BETWEEN :start AND :end 
            """)
    Long countOrdersByStatus(
        @Param("status") OrderStatus status,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );

    //2. Total Revenue (PAID ONLY)
    @Query("""
            SELECT COALESCE(SUM(o.totalAmount), 0)
            FROM Orders o
            WHERE o.status = :status
            AND o.paymentTime BETWEEN :start AND :end
        """)
    BigDecimal calculateRevenue(
        @Param("status") OrderStatus status,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );


    //3. for getting top groups 
    @Query("""
    SELECT new com.Chinmay.Hotel.DTO.Admin.TopGroupDTO(
        g.groupId,
        g.groupName,
        SUM(oi.quantity)
    )
    FROM Orders o
    JOIN o.orderItems oi
    JOIN oi.menuItem mi
    JOIN mi.menuGroup g
    WHERE o.status = :status
    AND o.paymentTime BETWEEN :start AND :end
    GROUP BY g.groupId, g.groupName
    ORDER BY SUM(oi.quantity) DESC
""")
List<TopGroupDTO> findTopGroups(
    @Param("status") OrderStatus status,
    @Param("start") LocalDateTime start,
    @Param("end") LocalDateTime end,
    Pageable pageable
);



    //4. for getting top items in a group
    @Query("""
    SELECT new com.Chinmay.Hotel.DTO.Admin.TopMenuItemDTO(
        mi.menuId,
        mi.itemName,
        SUM(oi.quantity)
    )
    FROM Orders o
    JOIN o.orderItems oi
    JOIN oi.menuItem mi
    WHERE o.status = :status
    AND mi.menuGroup.groupId = :groupId
    AND o.paymentTime BETWEEN :start AND :end
    GROUP BY mi.menuId, mi.itemName
    ORDER BY SUM(oi.quantity) DESC
""")
List<TopMenuItemDTO> findTopItemsByGroup(
    @Param("status") OrderStatus status,
    @Param("groupId") Long groupId,
    @Param("start") LocalDateTime start,
    @Param("end") LocalDateTime end,
    Pageable pageable
);





    
        

}
