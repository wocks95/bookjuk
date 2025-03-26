package com.bookjuk.api.portone.response;

import java.io.Serializable;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.portone.sdk.server.common.Customer;
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
public class CustomPayment implements Serializable {

  private static final long serialVersionUID = -7929028656246390812L;

  private String               status;
  private String               id;
  private String               transactionId;
  private String               merchantId;
  private String               storeId;
  private PaymentMethod        method;
  private Channel              channel;
  private String               version;
  private String               requestedAt;
  private String               updatedAt;
  private String               statusChangedAt;
  private String               orderName;
  private Amount               amount;
  private String               currency;
  private Customer             customer;
  private String               promotionId;
  private boolean              isCulturalExpense;
  private String               customData;
  private String               paidAt;
  private String               pgTxId;
  private String               pgResponse;
  private String               receiptUrl;
  private List<PaymentWebhook> webhooks;
  private List<Object>         disputes;         // disputes는 JSON에 빈 배열로 되어 있으므로 Object로 처리

}
