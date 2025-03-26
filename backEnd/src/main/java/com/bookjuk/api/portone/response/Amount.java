package com.bookjuk.api.portone.response;

import java.io.Serializable;
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
public class Amount implements Serializable {

  private Integer total;
  private Integer taxFree;
  private Integer vat;
  private Integer supply;
  private Integer discount;
  private Integer paid;
  private Integer cancelled;
  private Integer cancelledTaxFree;

}
