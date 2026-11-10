package com.Chinmay.Hotel;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.Chinmay.Hotel.common.enums.OrderStatus;
import com.Chinmay.Hotel.order.dto.AdminOrderPageDTO;
import com.Chinmay.Hotel.order.service.AdminOrderService;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class HotelApplicationTests {

	@Autowired
	private AdminOrderService adminOrderService;

	@Test
	void contextLoads() {
	}

	@Test
	void testServerSidePagination() {
		AdminOrderPageDTO page = adminOrderService.getOrdersPaged(
				null, 0, 10, "DESC", null, null
		);
		assertNotNull(page);
		assertTrue(page.getTotalElements() > 0, "Should have total elements count from database");
		assertTrue(page.getContent().size() <= 10, "Content should be limited to 10 elements");
		assertEquals(0, page.getCurrentPage());
		assertTrue(page.getTotalPages() > 0);

		// Test with Status = ACTIVE
		AdminOrderPageDTO activePage = adminOrderService.getOrdersPaged(
				OrderStatus.ACTIVE, 0, 25, "DESC", null, null
		);
		assertNotNull(activePage);
	}

}
