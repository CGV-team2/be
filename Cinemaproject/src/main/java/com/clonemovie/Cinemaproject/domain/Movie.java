package com.clonemovie.Cinemaproject.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor  // 기본 생성자 생성
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long movieId;
    private String title;
    @Column(length = 1024)
    private String overview;
    private String releaseDate;
    private String genresInKorean;
    private String hash;

    public Movie(String title, String overview, String  releaseDate, String genresInKorean, String hash) {
        this.title = title;
        this.overview = overview;
        this.releaseDate = releaseDate;
        this.genresInKorean = genresInKorean;
        this.hash = hash;
    }
}
