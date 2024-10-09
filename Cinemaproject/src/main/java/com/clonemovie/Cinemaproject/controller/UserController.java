package com.clonemovie.Cinemaproject.controller;


import com.clonemovie.Cinemaproject.domain.User;
import com.clonemovie.Cinemaproject.dto.UserDto.*;
import com.clonemovie.Cinemaproject.service.JwtUtility;
import com.clonemovie.Cinemaproject.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtility jwtUtility;

    @PostMapping("/user/add")
    public String signUp(@RequestBody UserCreateRequest request){
        User user = userService.createUser(
                request.getName(),
                request.getBirthDate(),
                request.getUserId(),
                request.getPassword()
        );
        if(user == null) return "이미 존재";
        return userService.login(request.getUserId(), request.getPassword());
    }


    @PostMapping("/user/login")
    public String login(@RequestBody UserLoginRequest request) {
        return userService.login(request.getUserId(),request.getPassword());
    }

    @GetMapping("/user/name")
    public ResponseEntity<String> getUserName(HttpServletRequest request) {
        String token = userService.extractTokenFromRequest(request);
        String userId = jwtUtility.validateToken(token).getSubject();

        String userName = userService.getUserNameByUserId(userId);

        return ResponseEntity.ok(userName);  // 단일 사용자 이름 반환
    }
}