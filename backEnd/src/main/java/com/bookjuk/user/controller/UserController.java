package com.bookjuk.user.controller;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import com.bookjuk.admin.service.AdminService;
import com.bookjuk.user.dto.UserDto;
import com.bookjuk.user.model.CustomUserDetails;
import com.bookjuk.user.service.UserService;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@Tag(name = "회원", description = "회원 API")
public class UserController {

  private final UserService  userService;
  private final AdminService adminService;


  @Operation(summary = "회원가입", description = "회원가입")
  @PostMapping(value = "/user/signup", produces = "application/json")
  public ResponseEntity<String> signup(@RequestBody UserDto userDto) {
    // 이메일 중복 체크
    try {
      userService.isEmailAvailable(userDto.getUserEmail()); // 이메일 중복 검사
    }
    catch (IllegalStateException e) {
      return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage()); // 이메일 중복일 경우 409 Conflict 응답
    }

    // 비밀번호 암호화 후 유저 저장
    userService.saveUser(userDto);

    // 유저 정보 확인
    System.out.println("Received birthdate: " + userDto.getUserBirthdate());
    System.out.println("가입한 유저: " + userDto.getUserEmail());

    // 회원가입 성공 응답
    return ResponseEntity.ok("회원가입 성공");
  }

  // 로그인 여부 확인
  @Operation(summary = "로그인 여부 확인", description = "로그인 여부 확인")
  @GetMapping(value = "/user/checklogin", produces = "application/json")
  public ResponseEntity<Map<String, Object>> checklogin() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    Object principal = authentication.getPrincipal(); // CustomUserDetails
    if (authentication != null && authentication.isAuthenticated()
        && !(authentication instanceof AnonymousAuthenticationToken)) {
      System.out.println("로그인 상태 맞음");
      UserDto loginUser = ((CustomUserDetails) principal).getUserDto(); // 로그인 된 사용자 정보
      System.out.println("로그인된 사용자 정보" + loginUser);
      return ResponseEntity.ok().body(Map.of("isAuthenticated", true));
    }
    else {
      System.out.println("로그인 상태 아님");
      return ResponseEntity.ok().body(Map.of("isAuthenticated", false));
    }
  }

  // 로그인 성공 후
  @Operation(summary = "로그인 성공 결과 전달", description = "로그인이 성공 했을 때 호출되는 API 입니다.")
  @GetMapping(value = "/user/loginSuccess", produces = "application/json")
  public ResponseEntity<Map<String, Object>> loginSuccess(HttpServletRequest request) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    Object         principal      = authentication.getPrincipal();                         // CustomUserDetails
    UserDto        loginUser      = ((CustomUserDetails) principal).getUserDto();          // 로그인 된 사용자 정보

    // 로그인 로그 삽입
    adminService.registLoginLog(request, loginUser);

    return ResponseEntity.ok(Map.of("isAuthenticated", true, "user", loginUser));

  }

  // 로그아웃 성공 후
  @Operation(summary = "로그아웃 성공 결과 전달", description = "로그아웃이 성공 했을 때 호출되는 API 입니다.")
  @GetMapping(value = "/user/logoutSuccess", produces = "application/json")
  public ResponseEntity<Void> logoutSuccess() {
    return ResponseEntity.ok().build();
  }

  // 관리자 여부 조회
  @Operation(summary = "관리자 여부 확인", description = "관리자 여부 확인")
  @GetMapping(value = "/admin", produces = "application/json")
  public ResponseEntity<Void> admin() {
    return ResponseEntity.ok().build();
  }

  // 사용자 정보 조회
  @Operation(summary = "사용자 조회", description = "사용자 조회")
  @GetMapping(value = "/user", produces = "application/json")
  public ResponseEntity<UserDto> user() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String         userEmail      = authentication.getName();
    UserDto        userDto        = userService.findByUserEmail(userEmail);
    return ResponseEntity.ok(userDto);
  }

  // 회원 탈퇴
  @Operation(summary = "회원탈퇴", description = "회원탈퇴")
  @DeleteMapping(value = "/user/delete")
  public ResponseEntity<Map<String, Object>> deleteUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
      return ResponseEntity.badRequest().body(Map.of("error", "로그인이 필요합니다."));
    }
    CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
    String            userEmail = principal.getUsername();
    userService.deleteByUserEmail(userEmail);

    return ResponseEntity.ok(Map.of("isConfirmed", true , "message", "회원탈퇴가 완료되었습니다."));
  }

  // 회원 수정
  @Operation(summary = "회원수정", description = "회원수정")
  @PutMapping(value = "/user/update")
  public ResponseEntity<Map<String, Object>> updateUser(@RequestBody UserDto userDto) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
      return ResponseEntity.badRequest().body(Map.of("error", "로그인이 필요합니다."));
    }
    CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
    String            userEmail = principal.getUsername();
    userService.updateUser(userEmail, userDto);

    return ResponseEntity.ok(Map.of("isModified",true));
  }

  // 닉네임 중복 확인 API
  @Operation(summary = "닉네임 중복 확인", description = "닉네임 중복 확인")
  @PostMapping("/user/checkNickname")
  public ResponseEntity<Map<String, Object>> checkNickname(
      @RequestBody Map<String, String> request
  ) {
    String nickname = request.get("nickname");

    // 닉네임 중복 여부 확인
    boolean isAvailable = userService.isNicknameAvailable(nickname);

    Map<String, Object> response = new HashMap<>();
    response.put("isAvailable", isAvailable); // 중복이 없으면 true

    return ResponseEntity.ok(response);
  }
  
  // 비밀번호 재확인
  @PostMapping("/user/verifyPassword")
  public ResponseEntity<Map<String, Object>> verifyPassword(@RequestBody Map<String, String> request) {
      String rawPassword = request.get("password");
      
      //  비밀번호가 null이거나 빈 값이면 오류 반환
      if (rawPassword == null || rawPassword.isEmpty()) {
          return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                  .body(Map.of("success", false, "message", "비밀번호가 입력되지 않았습니다."));
      }

      //  현재 로그인된 사용자 정보 가져오기
      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
      if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails)) {
          return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                  .body(Map.of("success", false, "message", "사용자 인증 실패"));
      }
      
      //Object         principal      = authentication.getPrincipal();                         
      //UserDto        loginUser      = ((CustomUserDetails) principal).getUserDto();
      
      String userEmail = authentication.getName();

      //  서비스 계층에서 비밀번호 검증
      boolean isValid = userService.verifyPassword(userEmail, rawPassword);

      if (isValid) {
          return ResponseEntity.ok(Map.of("success", true));
      } else {
          return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false));
        }
  }

}
