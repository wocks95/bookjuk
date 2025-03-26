package com.bookjuk.api.portone.response;

import java.time.LocalDateTime;
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
public class PaymentWebhook {

  // private PaymentWebhookStatus paymentStatus;
  private String                 paymentStatus;
  /** 웹훅 아이디 */
  String                         id;
  /** 웹훅 상태 */
  private String                 status;
  /**
   * 웹훅이 발송된 url
   *
   * V1 결제 건인 경우, 값이 존재하지 않습니다.
   */
  private String                 url;
  /**
   * 비동기 웹훅 여부
   *
   * V1 결제 건인 경우, 값이 존재하지 않습니다.
   */
  private boolean                isAsync;
  /** 현재 발송 횟수 */
  private int                    currentExecutionCount;
  /** 최대 발송 횟수 */
  private int                    maxExecutionCount;
  /** 웹훅 실행 맥락 */
  private String                 trigger;
  /** 웹훅 요청 정보 */
  private PaymentWebhookRequest  request;
  /** 웹훅 응답 정보 */
  private PaymentWebhookResponse response;
  /** 웹훅 처리 시작 시점 */
  // private LocalDateTime triggeredAt; // jackson-datatype-jsr310 lib 필요

}
