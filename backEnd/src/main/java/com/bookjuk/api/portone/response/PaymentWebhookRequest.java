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
public class PaymentWebhookRequest {

  private String code;
  private String header;
  private String body;
  private String respondedAt;

}
