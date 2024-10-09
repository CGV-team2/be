package com.clonemovie.Cinemaproject.dto;

import lombok.Data;
import java.util.Map;

public class GenreDto {

    @Data
    public static class GenreRequest {
        // 요청에 필요한 필드 (예시로 API에서 특정 장르를 요청할 때)
        private Integer genre_id;
    }

    @Data
    public static class GenreResponse {
        // 응답에 필요한 필드 (ID와 한글 장르명)
        private Map<Integer, String> genreMap; // 장르 ID와 한글명 매핑
    }
}
