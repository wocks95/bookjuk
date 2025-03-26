package com.bookjuk.user.dto.kakao;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;


@Getter

@JsonIgnoreProperties(ignoreUnknown = true)
public class KakaoAccount {
  
  //카카오계정 대표 이메일
  @JsonProperty("email")
  private String email;
  
  @JsonProperty("nickname")
  private String nickname;
  
  //닉네임 제공 동의 여부
  @JsonProperty("profile_nickname_needs_agreement")
  public Boolean isNickNameAgree;

  
  //이메일 제공 동의 여부
  @JsonProperty("email_needs_agreement")
  private Boolean isEmailAgree; 
  
  //이메일이 인증 여부
  //true : 인증된 이메일, false : 인증되지 않은 이메일
  @JsonProperty("is_email_verified")
  public Boolean isEmailVerified;
  
  //  연령대 포함 여부 등 카카오 API에서 반환되는 kakao_account  관련 필드를 추가해야합니다.

}
