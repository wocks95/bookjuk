package com.bookjuk.product.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookjuk.model.message.ResponseMessage;
import com.bookjuk.product.dto.ProductDto;
import com.bookjuk.product.dto.ProductInqDto;
import com.bookjuk.product.service.ProductListService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Tag(name = "상품", description = "상품 API")
public class ProductListController {

	private final ProductListService productListService;
	
	
	// 신규 상품 리스트 조회
	@Operation(summary = "신규 상품 목록 조회", description = "신규 상품 목록 조회")
	@GetMapping(value = "/product/new", produces = "application/json")
	public ResponseMessage ProductList(
			@RequestParam(required = false) LocalDate startDate,
			@RequestParam(required = false) LocalDate endDate,
			@RequestParam(required = false) Integer genreId,
			Pageable pageable) {
		return ResponseMessage.builder()
				             .status(200)
				             .message("신규 상품 목록 조회 성공")
				             .results(productListService.findProductList(startDate, endDate, genreId, pageable))
				             .build();
	}
	
	
	// 상품 상세 + 상품 문의글 조회	
	@Operation(summary = "상품 상세, 문의글 조회", description = "상품 상세, 문의글 조회")
	@GetMapping(value="/product/detail/{productId}", produces = "application/json")
	public ResponseMessage Productdetail(@PathVariable(name = "productId") Integer productId) {
		
		// 서비스에서 map으로 한번에 가져오기 
		Map<String, Object> productDetails = productListService.findProductById(productId);
		
		// 상품과 문의글을 각각 분리
		ProductDto product = (ProductDto) productDetails.get("product");
		List<ProductInqDto> inquiries = (List<ProductInqDto>) productDetails.get("inquiries");
		
		if (product == null) {
			product = new ProductDto();
		}
		
		if (inquiries == null) {
			inquiries = new ArrayList<>();
		}
		
		return ResponseMessage.builder()
				     .status(200)
				     .message("상품 상세 조회 성공")
				     .results(Map.of("product", product, "inquiries", inquiries))
				     .build();
	}
	
	
	// 인기 상품 리스트 조회
	@Operation(summary = "인기 상품 목록 조회", description = "인기 상품 목록 조회")
	@GetMapping(value="/product/popular", produces = "application/json")
	public ResponseMessage ProductPopularList(
			@RequestParam(required = false) Integer genreId,
			Pageable pageable) {
		return ResponseMessage.builder()
								.status(200)
								.message("인기 상품 목록 조회 성공")
								.results(productListService.findPopularProductList(genreId, pageable))
								.build();
	}	
	
	
}	
