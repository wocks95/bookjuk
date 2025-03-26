package com.bookjuk.api.portone.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@Builder
@JsonIgnoreProperties(ignoreUnknown = true) // 알 수 없는 필드는 무시
public class PaymentWebhookStatus {

  private String                 paymentStatus;
  private String                 id;
  private String                 status;
  private String                 url;
  private String                 isAsync;
  private String                 currentExecutionCount;
  private PaymentWebhookRequest  request;
  private PaymentWebhookResponse response;
  // private LocalDateTime triggeredAt; // jackson-datatype-jsr310 lib 필요

}
