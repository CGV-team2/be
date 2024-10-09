package com.clonemovie.Cinemaproject.repository.jpa;


import com.clonemovie.Cinemaproject.domain.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MovieRepository extends JpaRepository<Movie, Long> {
    Optional<Movie> findByHash(String hash);  // 해시값으로 영화 조회
}
