package com.bookjuk.api.portone.response;

import java.io.Serializable;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

//@JsonTypeInfo(
//    use = JsonTypeInfo.Id.NAME,
//    include = JsonTypeInfo.As.PROPERTY,
//    property = "type")
//@JsonSubTypes({
//    @JsonSubTypes.Type(value = PaymentMethodCard.class, name = "PaymentMethodCard"),
//    @JsonSubTypes.Type(value = PaymentMethodConvenienceStore.class, name = "PaymentMethodConvenienceStore"),
//    @JsonSubTypes.Type(value = PaymentMethodEasyPay.class, name = "PaymentMethodEasyPay"),
//    @JsonSubTypes.Type(value = PaymentMethodGiftCertificate.class, name = "PaymentMethodGiftCertificate"),
//    @JsonSubTypes.Type(value = PaymentMethodMobile.class, name = "PaymentMethodMobile"),
//    @JsonSubTypes.Type(value = PaymentMethodTransfer.class, name = "PaymentMethodTransfer"),
//    @JsonSubTypes.Type(value = PaymentMethodVirtualAccount.class, name = "PaymentMethodVirtualAccount")
//})
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@Builder
@JsonIgnoreProperties(ignoreUnknown = true) // 알 수 없는 필드는 무시
public class PaymentMethod implements Serializable {
//
//  // Recognized 하위 인터페이스
//  interface Recognized extends PaymentMethod {}
//
//  // Unrecognized 구현체
//  class Unrecognized implements PaymentMethod {
//    // Unrecognized는 데이터가 없으므로 빈 클래스로 정의
//  }
  
  @JsonProperty("easyPayType")
  String type;

}
