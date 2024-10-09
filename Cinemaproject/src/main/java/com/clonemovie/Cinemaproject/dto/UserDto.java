package com.clonemovie.Cinemaproject.dto;


import lombok.Data;

public class UserDto {

    @Data
    public static class UserCreateRequest {
        private String name;
        private String birthDate;
        private String userId;
        private String password;
    }

    @Data
    public static class UserLoginRequest {
        private String userId;
        private String password;
    }
}
