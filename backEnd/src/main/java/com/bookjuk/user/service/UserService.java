package com.bookjuk.user.service;




import com.bookjuk.user.dto.UserDto;


public interface UserService {

  void saveUser(UserDto userDto);
  
  void isEmailAvailable(String userEmail);
  
  UserDto findByUserEmail(String userEmail);
  
  boolean isNicknameAvailable(String userNickname);

  void deleteByUserEmail(String userEmail);

  void updateUser(String userEmail, UserDto userDto);

  boolean verifyPassword(String userName, String rawPassword);

}
