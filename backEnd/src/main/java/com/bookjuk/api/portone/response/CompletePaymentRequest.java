package com.bookjuk.api.portone.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 결제 완료 요청 시 클라이언트에서 전달받는 필수값을 검증하기 위한 DTO입니다.
 * 각 필드는 필수값이며, 아래 주석에서 각 필드의 역할과 데이터 타입을 명시합니다.
 */
@Data
public final class CompletePaymentRequest {

  @JsonProperty("paymentId")
  @NotBlank // 필드가 null, 빈 문자열 "", 공백 " "이 되는 것을 방지 – 결제 고유 ID (string)
  String paymentId;

  // @JsonProperty("storeId")
  @NotBlank // 가맹점 식별자 (string)
  String storeId;

  // @JsonProperty("channelKey")
  @NotBlank // 채널 키 (string)
  String channelKey;

  // @JsonProperty("orderName")
  @NotBlank // 주문명 (string)
  String orderName;

  // @JsonProperty("totalAmount")
  @NotNull // 결제 금액 (number: Integer)
  Integer totalAmount;

  // @JsonProperty("currency")
  @NotBlank // 결제 통화 (예: "KRW", string)
  String currency;

  // @JsonProperty("payMethod")
  // @NotBlank // 결제 수단 (예: "CARD", string)
  // String payMethod;

  @JsonProperty("payMethod")
//  @NotBlank // 결제 수단 (예: "CARD", string)
  PaymentMethod payMethod;

  // @JsonProperty("customData")
  @NotBlank // 커스텀 데이터 (JSON 문자열, 내부에 아이템 ID를 포함해야 함, string)
  String customData;

}
