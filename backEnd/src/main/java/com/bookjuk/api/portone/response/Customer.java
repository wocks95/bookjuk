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
public class Customer implements Serializable {

  private String id;
  private String name;
  private String birthYear;
  private String gender;     // Gender type
  private String email;
  private String phoneNumber;
  private String address;    // Address type
  private String zipcode;

}
