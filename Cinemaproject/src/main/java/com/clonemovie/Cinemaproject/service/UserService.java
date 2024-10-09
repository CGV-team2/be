package com.clonemovie.Cinemaproject.service;

import com.clonemovie.Cinemaproject.domain.User;
import com.clonemovie.Cinemaproject.repository.jpa.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final JwtUtility jwtUtility;

    // 회원가입
    @Transactional
    public User createUser(String name, String birthDate,String userId, String password) {
        User user = userRepository.findByUserId(userId);
        if (user != null) {
            return null;  // 이미 존재하는 사용자일 경우 처리
        }
        User newUser = new User(name, birthDate,userId, password);  // 암호화된 비밀번호 저장
        return userRepository.save(newUser);
    }
    // 로그인
    public String login(String userId, String password){
        User user = userRepository.findByUserId(userId);
        if(user != null && user.checkPassword(password)) {
            return jwtUtility.generateToken(userId);
        }
        return null;
    }

    // 헤더에서 Bearer 토큰 추출
    public String extractTokenFromRequest(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7);  // "Bearer " 이후의 토큰만 추출
        }
        throw new IllegalArgumentException("Authorization header is missing or invalid.");
    }

    //사용자 id로 사용자 이름찾기
    public String getUserNameByUserId(String userId) {
        User user = userRepository.findByUserId(userId);
        if (user != null) {
            return user.getName();
        }
        throw new RuntimeException("사용자를 찾을 수 없습니다.");
    }
}
