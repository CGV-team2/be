package com.clonemovie.Cinemaproject.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.util.List;

@Data
public class MovieDto {

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MovieCreateRequest {
        private Long id;
        private String title;
        private String overview;
        private String release_date;
        private List<Integer> genre_ids;
        private boolean adult;
        private String poster_path;
        private String backdrop_path;
        private String original_language;
        private String original_title;
        private Double popularity;
        private Double vote_average;
        private Integer vote_count;
    }

    @Data
    public static class MovieResponse {
        private Long id;
        private String title;
        private String overview;
        private String release_date;
        private List<String> genresInKorean; // 한글로 변환된 장르 리스트
        private String poster_path;
        private String backdrop_path;
        private Double vote_average;
        private Integer vote_count;
        private String original_language;
        private String original_title;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TmdbResponse {
        private List<MovieCreateRequest> results; // TMDB에서 받은 영화 데이터 리스트
    }
}
