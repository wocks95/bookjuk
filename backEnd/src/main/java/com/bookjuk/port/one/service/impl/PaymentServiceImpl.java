package com.bookjuk.port.one.service.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import org.springframework.stereotype.Service;
import com.bookjuk.api.portone.CustomPaymentClient;
import com.bookjuk.api.portone.response.CustomPayment;
import com.bookjuk.cart.service.ICartService;
import com.bookjuk.order.domain.User;
import com.bookjuk.order.dto.OrderDto;
import com.bookjuk.order.dto.OrderItemDto;
import com.bookjuk.order.service.IOrderService;
import com.bookjuk.port.one.Payment;
import com.bookjuk.port.one.PaymentCustomData;
import com.bookjuk.port.one.PaymentInfo;
import com.bookjuk.port.one.PaymentPaymentInfo;
import com.bookjuk.port.one.domain.Product;
import com.bookjuk.port.one.repository.PayRepository;
import com.bookjuk.port.one.repository.ProductRepository;
import com.bookjuk.port.one.request.SyncPaymentException;
import com.bookjuk.port.one.service.IPaymentService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.portone.sdk.server.payment.CancelPaymentBodyRefundAccount;
import io.portone.sdk.server.payment.CancelRequester;
import io.portone.sdk.server.payment.PaidPayment;
import io.portone.sdk.server.payment.PaymentClient;
import io.portone.sdk.server.payment.PromotionDiscountRetainOption;
import io.portone.sdk.server.payment.VirtualAccountIssuedPayment;
import io.portone.sdk.server.webhook.Webhook;
import io.portone.sdk.server.webhook.WebhookTransaction;
import io.portone.sdk.server.webhook.WebhookVerifier;
import kotlin.Unit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

/**
 * PaymentServiceImpl은 IPaymentService 인터페이스를 구현하여 결제 관련 비즈니스 로직을 처리합니다.
 * 결제 완료 시 동기화, 결제 검증, 결제 취소 및 웹훅 처리를 담당합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements IPaymentService {

  // 결제 정보를 저장하는 임시 메모리(실제 환경에서는 데이터베이스를 사용해야 함)
  private static final Map<String, Payment> paymentStore = new HashMap<>();
  private static final ObjectMapper         objectMapper = new ObjectMapper();

  // 서비스 의존성 (장바구니 서비스 및 상품 리포지토리)
  private final ICartService      iCartService;
  private final ProductRepository productRepository;
  private final PayRepository     payRepository;
  private final IOrderService     iOrderService;

  // 포트원 결제 클라이언트와 커스텀 결제 클라이언트, 그리고 웹훅 검증 객체를 초기화합니다.
  // 실제 환경에서는 비밀정보를 별도 프로퍼티 파일이나 시크릿 매니저로 관리해야 합니다.
  private final PaymentClient       portone        = new PaymentClient(
      "pWw5BI1fPoncJnEuZ6PF5ILF9Svx3hLEu2UaAg72S5XJbJa5yEHgQFAT5eYVXJRjUnhypozpWzhHvGeg",
      "https://api.portone.io", null
  );
  private final CustomPaymentClient customPortone  = new CustomPaymentClient(
      "pWw5BI1fPoncJnEuZ6PF5ILF9Svx3hLEu2UaAg72S5XJbJa5yEHgQFAT5eYVXJRjUnhypozpWzhHvGeg",
      "https://api.portone.io", null
  );
  private final WebhookVerifier     portoneWebhook = new WebhookVerifier(
      "whsec_+wCY1q64BB0Mm2BzrPr4UXIIA3UDowwJu6SIE4e8S14="
  );

  /**
   * 결제 완료 요청(브라우저 호출 또는 웹훅 호출)을 받아 결제 상태를 동기화합니다.
   * 서버의 결제 데이터베이스와 포트원의 결제 정보를 비교하여, 결제 검증 후 상태를 업데이트합니다.
   *
   * @param  paymentId 결제 고유 식별자
   * 
   * @return           Mono&lt;Payment&gt; 동기화된 결제 상태를 반환
   */
  @Override
  public Mono<Payment> syncPayment(String paymentId) {
    Payment payment = paymentStore.get(paymentId);
    if (payment == null) {
      payment = new Payment("PENDING");
      paymentStore.put(paymentId, payment);
    }
    Payment finalPayment = payment;

    return Mono.fromFuture(portone.getPayment(paymentId))
        .onErrorMap(ignored -> new SyncPaymentException())
        .flatMap(actualPayment -> {
          if (actualPayment instanceof PaidPayment) {
            PaidPayment paidPayment = (PaidPayment) actualPayment;
            if (!verifyPayment(paidPayment)) {
              // 검증이 실패하면 결제를 취소
              // cancelAmount로 null을 넘기면 전액 취소 처리됨
              return cancelPayment(paymentId, "검증 실패로 인한 자동 취소", null)
                  .flatMap(cancelResponse -> Mono.error(new SyncPaymentException()));
            }
            log.info("결제 성공 {}", actualPayment);
            if (finalPayment.status().equals("PAID")) {
              return Mono.just(finalPayment);
            }
            else {
              Payment newPayment = new Payment("PAID");
              paymentStore.put(paymentId, newPayment);
              return Mono.just(newPayment);
            }
          }
          else if (actualPayment instanceof VirtualAccountIssuedPayment) {
            Payment newPayment = new Payment("VIRTUAL_ACCOUNT_ISSUED");
            paymentStore.put(paymentId, newPayment);
            return Mono.just(newPayment);
          }
          else {
            return Mono.just(finalPayment);
          }
        });
  }

  /**
   * 결제 취소 로직을 별도의 메서드로 분리하였습니다.
   * 이 메서드는 다른 곳에서도 호출할 수 있으며, 취소 사유(reason)와 취소 금액(cancelAmount)을 전달받습니다.
   *
   * @param  paymentId    결제 고유 식별자
   * @param  reason       결제 취소 사유 (예: "검증 실패로 인한 자동 취소")
   * @param  cancelAmount 취소할 금액 (null이면 전액 취소)
   * 
   * @return              Mono&lt;?&gt; 취소 작업의 결과
   */
  private Mono<?> cancelPayment(String paymentId, String reason, Long cancelAmount) {
    return Mono.fromFuture(
        portone.cancelPayment(
            paymentId,
            (Long) cancelAmount, // 결제 취소 금액: (Long) 타입으로 강제 캐스팅, null이면 전액 취소
            (Long) null, // 면세 금액 (taxFreeAmount)
            (Long) null, // 부가세 금액 (vatAmount)
            reason, // 취소 사유
            (CancelRequester) null, // 취소 요청자
            (PromotionDiscountRetainOption) null, // 프로모션 할인 보유 옵션
            (Long) null, // 현재 취소 가능 금액 (currentCancellableAmount)
            (CancelPaymentBodyRefundAccount) null // 환불 계좌 정보
        )
    );
  }

  /**
   * 웹훅 요청을 처리하여 결제 상태를 동기화합니다.
   * 웹훅 검증에 실패할 경우 SyncPaymentException을 발생시킵니다.
   *
   * @param  body                 웹훅 요청 본문(텍스트)
   * @param  webhookId            웹훅 ID
   * @param  webhookTimestamp     웹훅 타임스탬프
   * @param  webhookSignature     웹훅 서명
   * 
   * @return                      Mono&lt;Unit&gt; 웹훅 처리 결과
   * 
   * @throws SyncPaymentException 웹훅 검증 실패 시 발생하는 예외
   */
  @Override
  public Mono<Unit> handleWebhook(
      String body, String webhookId, String webhookTimestamp, String webhookSignature
  ) throws SyncPaymentException {
    Webhook webhook;
    try {
      webhook = portoneWebhook.verify(body, webhookId, webhookSignature, webhookTimestamp);
    }
    catch (Exception e) {
      throw new SyncPaymentException();
    }
    if (webhook instanceof WebhookTransaction transaction) {
      return syncPayment(transaction.getData().getPaymentId()).map(payment -> Unit.INSTANCE);
    }
    return Mono.empty();
  }

  /**
   * 결제 단건 조회 메서드입니다.
   * 외부 API를 통해 결제 건을 조회하고 결과를 출력합니다.
   *
   * @param  paymentId 결제 고유 식별자
   * 
   * @return           CustomPayment 조회된 결제 정보
   */
  private CustomPayment getPayment(String paymentId) {
    // 결제 단건 조회
    CompletableFuture<CustomPayment> future = customPortone.getPayment(paymentId);

    // 비동기 결과 처리
    future.thenAccept(customPayment -> {
      System.out.println("Payment getStatus: " + customPayment.getStatus());
      System.out.println("Payment Status: " + customPayment.getOrderName());
      System.out.println("Payment Amount: " + customPayment.getAmount());
      // TODO : 결제건 검증은 여기서 진행
    }).exceptionally(ex -> {
      System.err.println("Failed to fetch payment: " + ex.getMessage());
      return null;
    });

    // 커스텀 포트원 클라이언트 종료
    customPortone.close();

    // 비동기 작업이 완료될 때까지 대기 후 CustomPayment 결과 리턴
    return future.join();
  }

  /**
   * 결제 승인 정보와 결제 항목의 검증을 진행하는 메서드입니다.
   * 포트원의 customData 파라미터를 활용하여 결제 항목의 정보와 실제 상품 정보를 검증합니다.
   *
   * @param  payment 결제 승인 정보(PaidPayment)
   * 
   * @return         boolean 결제 정보 검증 성공 여부
   */
  public boolean verifyPayment(PaidPayment payment) {
    String customDataJson = payment.getCustomData();
    if (customDataJson == null) return false;

    PaymentCustomData customDataDecoded;
    try {
      customDataDecoded = objectMapper.readValue(customDataJson, PaymentCustomData.class);
    }
    catch (JsonProcessingException e) {
      return false;
    }

    int computedSum = 0;
    // 프론트엔드에서 전달받은 각 결제 항목을 순회하며 검증합니다.
    for (PaymentPaymentInfo item : customDataDecoded.item()) {
      PaymentInfo info = item.paymentInfo();

      // productId는 String 형태로 전달되므로 Integer로 변환
      Integer pid;
      try {
        pid = info.productId();
      }
      catch (NumberFormatException e) {
        return false;
      }

      // tbl_product에서 상품 정보 조회
      Optional<Product> productOpt = productRepository.findById(pid);
      if (!productOpt.isPresent()) {
        return false;
      }
      Product product = productOpt.get();

      // 주문 수량이 재고보다 크면 안됨
      if (info.quantity() > product.getStock()) {
        return false;
      }

      // 가격이 DB에 저장된 상품 가격과 동일한지 검증
      if (info.price() != product.getProductPrice()) {
        return false;
      }

      // 상품 판매 여부(salesYn)가 'Y'여야 함
      if (product.getSalesYn() == null || product.getSalesYn() != 'Y') {
        return false;
      }

      // 각 항목의 (수량 × 가격)을 합산합니다.
      computedSum += info.quantity() * info.price();
    }

    // 전 상품의 합계가 결제 요청 금액과 동일한지 확인
    if (payment.getAmount().getTotal() != computedSum) {
      return false;
    }

    // 결제 통화가 "KRW"인지 검증
    if (!"KRW".equals(payment.getCurrency().getValue())) {
      return false;
    }

    // ********검증 이후(결제성공) 상품 수량 변경
    for (PaymentPaymentInfo item : customDataDecoded.item()) {
      PaymentInfo info    = item.paymentInfo();
      Product     product = productRepository.findById(info.productId()).get();
      product.setStock(product.getStock() - info.quantity());
      productRepository.save(product);
    }

    // ********검증 이후(결제성공) 장바구니 아이탬 삭제
    for (PaymentPaymentInfo item : customDataDecoded.item()) {
      PaymentInfo info = item.paymentInfo();
      iCartService.deleteCartItem(info.cartItemId());
    }

    // ********검증 이후(결제 성공) Order 생성 로직 수정
    List<OrderItemDto> orderItemList     = new ArrayList<>();
    int                userId            = 0;
    int                shippingAddressId = 0;
    int                totalPrice        = 0;
    boolean            totalPriceSet     = false;

    for (PaymentPaymentInfo item : customDataDecoded.item()) {
      PaymentInfo info = item.paymentInfo();

      // 사용자와 배송 주소 정보는 모든 항목에서 동일하다고 가정
      if (userId == 0) {
        userId            = info.userId();
        shippingAddressId = info.shippingAddressId();
      }

      // 첫 번째 항목에서 전체 결제 금액(total)은 한 번만 할당
      if (!totalPriceSet) {
        totalPrice    = info.total();
        totalPriceSet = true;
      }

      // 각 주문 항목(OrderItemDto) 생성 및 리스트에 추가
      OrderItemDto orderItemDto = OrderItemDto.builder()
          .product(
              com.bookjuk.order.domain.Product.builder()
                  .productId(info.productId())
                  .build()
          )
          .orderStatus(
              com.bookjuk.order.domain.OrderStatus.builder()
                  .orderStatusId(1) // 예시: 주문 상태 코드 1 사용
                  .build()
          )
          .quantity(info.quantity())
          .price(info.price())
          .build();
      orderItemList.add(orderItemDto);
    }

    // 단일 OrderDto 생성
    OrderDto orderDto = OrderDto.builder()
        .user(new User(userId))
        .deliAddr(
            com.bookjuk.order.domain.DeliAddr.builder()
                .addrId(shippingAddressId)
                .build()
        )
        .totalPrice(totalPrice)
        .orderItems(orderItemList)
        .build();

    // OrderServiceImpl의 insertOrder 메서드를 통해 단일 주문 생성
    OrderDto createdOrder = iOrderService.insertOrder(userId, orderDto);

    // ********검증 이후(결제 성공) Pay 객체 생성
    if (createdOrder != null && createdOrder.getOrderId() != null) {
      com.bookjuk.order.domain.Order order = new com.bookjuk.order.domain.Order();
      order.setOrderId(createdOrder.getOrderId());

      com.bookjuk.port.one.domain.Pay pay = com.bookjuk.port.one.domain.Pay.builder()
          .order(order) // 생성한 Order 객체 사용
          .impUid(payment.getTransactionId()) // impUid는 결제의 paymentId 사용
          .amount(createdOrder.getTotalPrice()) // 결제 금액은 전체 구매 금액 사용
          .payStatus("결제완료")
          .build();

      // tbl_pay DB에 저장
      payRepository.save(pay);

    }

    return true;
  }

}
