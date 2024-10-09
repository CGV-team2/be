package com.clonemovie.Cinemaproject.service;

import com.clonemovie.Cinemaproject.config.IamportConfig;
import com.clonemovie.Cinemaproject.dto.MovieDto.*;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.stereotype.Service;
import org.springframework.data.redis.core.RedisTemplate;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final RedisTemplate<String, String> redisTemplate;
    private final GenreMapper genreMapper;  // 장르 변환을 위한 Mapper
    private static final String TMDB_HASH_KEY = "movies:now_playing:hash";
    private final IamportConfig iamportConfig;


    // TMDB API에서 데이터를 받아와 클라이언트로 전달하는 메서드
    public List<MovieResponse> fetchNowPlayingMovies() throws IOException {
        OkHttpClient client = new OkHttpClient();
        String apiKey = iamportConfig.getTmdbApiKey();  // Config에서 API Key 가져오기

//        String apiKey = "c3d8374f328df623ba0cc4e206ce419c";  // 실제 TMDB API 키로 교체

        // TMDB API 호출 URL
        String url = "https://api.themoviedb.org/3/movie/now_playing?language=ko-KR&page=1&api_key=" + apiKey;
        Request request = new Request.Builder().url(url).get().addHeader("accept", "application/json").build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Unexpected code " + response);
            }

            String responseBody = response.body().string();
            ObjectMapper mapper = new ObjectMapper();
            TmdbResponse tmdbResponse = mapper.readValue(responseBody, TmdbResponse.class);

            // 영화 목록의 해시 값 생성
            String newHash = generateListHash(tmdbResponse.getResults());

            // Redis에서 기존 해시 값을 가져옴
            String cachedHash = redisTemplate.opsForValue().get(TMDB_HASH_KEY);

            // 해시 값이 없거나 변경되었으면 업데이트
            if (cachedHash == null || !cachedHash.equals(newHash)) {
                redisTemplate.opsForValue().set(TMDB_HASH_KEY, newHash);
                // 추가적인 데이터 처리나 DB 저장은 생략 (원본 데이터를 클라이언트로 그대로 전달할 것이기 때문에)
            }

            // 장르 변환 후 응답 리스트 생성
            return tmdbResponse.getResults().stream().map(movieDto -> {
                List<String> genresInKorean = movieDto.getGenre_ids().stream()
                        .map(genreMapper::getGenreName)  // 장르 ID를 한글 이름으로 변환
                        .collect(Collectors.toList());

                // 변환된 데이터를 MovieResponse로 생성
                MovieResponse movieResponse = new MovieResponse();
                movieResponse.setId(movieDto.getId());
                movieResponse.setTitle(movieDto.getTitle());
                movieResponse.setOverview(movieDto.getOverview());
                movieResponse.setRelease_date(movieDto.getRelease_date());
                movieResponse.setGenresInKorean(genresInKorean);
                movieResponse.setPoster_path(movieDto.getPoster_path());
                movieResponse.setBackdrop_path(movieDto.getBackdrop_path());
                movieResponse.setVote_average(movieDto.getVote_average());
                movieResponse.setVote_count(movieDto.getVote_count());
                movieResponse.setOriginal_language(movieDto.getOriginal_language());
                movieResponse.setOriginal_title(movieDto.getOriginal_title());

                return movieResponse;
            }).collect(Collectors.toList());
        }
    }

    // 영화 목록에 대한 해시 값을 생성하는 메서드
    private String generateListHash(List<MovieCreateRequest> movies) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            String json = mapper.writeValueAsString(movies);  // 여기서 IOException 발생 가능
            return DigestUtils.sha256Hex(json);
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}
