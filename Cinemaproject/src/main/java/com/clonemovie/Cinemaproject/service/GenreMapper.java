package com.clonemovie.Cinemaproject.service;

import com.clonemovie.Cinemaproject.dto.GenreDto;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class GenreMapper {

    // GenreResponse를 생성하는 메서드
    public GenreDto.GenreResponse getGenreResponse() {
        GenreDto.GenreResponse genreResponse = new GenreDto.GenreResponse();
        genreResponse.setGenreMap(getGenreMap());
        return genreResponse;
    }

    // 장르 ID와 한글명을 매핑하는 메서드
    private Map<Integer, String> getGenreMap() {
        Map<Integer, String> genreMap = new HashMap<>();
        genreMap.put(28, "액션");
        genreMap.put(12, "모험");
        genreMap.put(16, "애니메이션");
        genreMap.put(35, "코미디");
        genreMap.put(80, "범죄");
        genreMap.put(99, "다큐멘터리");
        genreMap.put(18, "드라마");
        genreMap.put(10751, "가족");
        genreMap.put(14, "판타지");
        genreMap.put(36, "역사");
        genreMap.put(27, "공포");
        genreMap.put(10402, "음악");
        genreMap.put(9648, "미스터리");
        genreMap.put(10749, "로맨스");
        genreMap.put(878, "SF");
        genreMap.put(53, "스릴러");
        genreMap.put(10752, "전쟁");
        genreMap.put(37, "서부");
        return genreMap;
    }

    // 장르 ID로 한글 장르명을 반환하는 메서드
    public String getGenreName(Integer genreId) {
        return getGenreMap().getOrDefault(genreId, "알 수 없는 장르");
    }
}