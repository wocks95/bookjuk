package com.bookjuk.user.service.impl;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.bookjuk.user.domain.User;
import com.bookjuk.user.repository.UserRepository;
import com.bookjuk.user.service.SocialService;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Transactional
@RequiredArgsConstructor
@Service

public class SocialServiceImpl implements SocialService {
  
  private final UserRepository userRepository;
  private final ObjectMapper objectMapper;

  

  //환경 변수에서 카카오 API 정보 불러오기
   @Value("${kakao.client-id}")
   private String kakaoClientId;
  
   @Value("${kakao.redirect-uri}")
   private String kakaoRedirectUri;
  
   @Value("${kakao.client-secret}")
   private String kakaoClientSecret;
  
   @Value("${kakao.token-uri}")
   private String kakaoTokenUri;
  
   
   
   /* 카카오 간편 로그인*/
   @Override
   public Map<String, Object>  getKakaoUser(String accessToken) {
    
   String apiUrl =  "https://kapi.kakao.com/v2/user/me"; 
   
   HttpHeaders headers = new HttpHeaders();
   headers.add("Authorization", "Bearer " + accessToken);
   
   HttpEntity<String> httpEntity = new HttpEntity<>(headers);
   
   RestTemplate restTemplate = new RestTemplate();
   ResponseEntity<HashMap> responseEntity = restTemplate.exchange(
       apiUrl,
       HttpMethod.GET,
       httpEntity ,
       HashMap.class,
       headers);
   
   HashMap<String, Object> map = responseEntity.getBody();
   
   HashMap<String, Object> obj = (HashMap) map.get("kakao_account");
   String email = (String) obj.get("email");
   String nickname = (String) ((HashMap)obj.get("profile")).get("nickname");

   System.out.println(email);
   System.out.println(nickname);

   
   User easyLoginUser = userRepository.findByUserEmail(email);
  
   if(easyLoginUser != null) {
     return Map.of("type", "login", "easyLoginUser", easyLoginUser);
   } else {
     // 없으면 회원가입하기
     return Map.of("type", "signup", "email", email, "nickname", nickname);
   }
   
  }
   
   @Value("${Naver.client-id}")
   private String NaverClientId;
   
   @Value("${Naver.redirect-uri}")
   private String NaverRedirectUri;
   
   @Value("${Naver.client-secret}")
   private String NaverClientSecret;
   
   @Value("${Naver.token-uri}")
   private String NaverTokenUri;
   
   @Override
  public Map<String, Object> getNaverToken(String code, String state) {
     
     String url = UriComponentsBuilder.fromHttpUrl("https://nid.naver.com/oauth2.0/token")
           .queryParam("grant_type", "authorization_code")
           .queryParam("client_id",  NaverClientId)
           .queryParam("client_secret", NaverClientSecret)
           .queryParam("redirect_uri", NaverRedirectUri)
           .queryParam("code", code)
           .queryParam("state", state)
           .toUriString();
     
     System.out.println("Request url:" + url);
     
     try {
       
       HttpHeaders headers = new HttpHeaders();
       headers.setContentType(MediaType.APPLICATION_JSON);
       HttpEntity<?> httpEntity = new HttpEntity<>(headers);
       
       RestTemplate restTemplate = new RestTemplate();
       ResponseEntity<HashMap<String, Object>> responseEntity = restTemplate.exchange(
           url,
           HttpMethod.GET,
           httpEntity,
           new ParameterizedTypeReference<HashMap<String, Object>>() {}
           );       
       HashMap<String, Object> map = responseEntity.getBody();
       
       System.out.println("map: " + map);
       
       return getNaverUser((String) map.get("access_token"));
     
   } catch (HttpClientErrorException e) {
       throw new RuntimeException("네이버 토큰 요청 실패: " + e.getResponseBodyAsString());
   } catch (Exception e) {
       throw new RuntimeException("JSON 변환 실패: " + e.getMessage());
   }
         
  }
   


   /* 네이버 간편 로그인*/
  @Override
  public Map<String, Object> getNaverUser(String accessToken) {
    String apiUrl =  "https://openapi.naver.com/v1/nid/me"; 
    
    HttpHeaders headers = new HttpHeaders();
    headers.add("Authorization", "Bearer " + accessToken);
    
    System.out.println("AccessToken: " + accessToken);
    
    HttpEntity<String> httpEntity = new HttpEntity<>(headers);
    
    RestTemplate restTemplate = new RestTemplate();
    ResponseEntity<HashMap> responseEntity = restTemplate.exchange(
        apiUrl,
        HttpMethod.GET,
        httpEntity ,
        HashMap.class
        );
    
    HashMap<String, Object> map = responseEntity.getBody();
    
    // 디버깅: 네이버 응답을 확인
    System.out.println("Naver API Response: " + map);
   
    if (map == null) {
      throw new RuntimeException("네이버 응답이 null입니다. API 요청을 확인하세요.");
    }
    //  map에서 실제 들어있는 키 확인!
    // System.out.println("🔍 Response Keys: " + map.keySet());
    
    // response 키가 있는지 확인!
    //if (!map.containsKey("response")) {
    //    throw new RuntimeException("response 필드가 응답에 없습니다! 대신 들어있는 데이터: " + map);
    //}
    
    HashMap<String, Object> obj = (HashMap<String, Object>) map.get("response");
    // System.out.println("User Data: " + obj);
    
    String email = (String) obj.get("email");
    String nickname = (String) obj.get("nickname");
    
    // System.out.println("Email: " + email);
    // System.out.println("Nickname: " + nickname);
    
    User naverLoginUser = userRepository.findByUserEmail(email);
    System.out.println("naverLoginUser:" + naverLoginUser);
    
    if(naverLoginUser != null) {
      return Map.of("type", "login", "naverLoginUser", naverLoginUser);
    } else {
      // 없으면 회원가입하기
      return Map.of("type", "signup", "email", email, "nickname", nickname);
    }
  }
  
}
