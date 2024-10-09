package com.clonemovie.Cinemaproject.controller;

import com.clonemovie.Cinemaproject.dto.MovieDto;
import com.clonemovie.Cinemaproject.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor  // MovieService 주입
public class MovieController {

    private final MovieService movieService;

    @GetMapping("/movies/now_playing")
    public List<MovieDto.MovieResponse> getNowPlayingMovies() throws IOException {
        return movieService.fetchNowPlayingMovies();
    }
}
