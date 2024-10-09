package com.clonemovie.Cinemaproject.service;

import com.clonemovie.Cinemaproject.domain.Reservation;
import com.clonemovie.Cinemaproject.dto.ReservationDto;
import com.clonemovie.Cinemaproject.dto.ReservationDto.ReservedSeatsResponse;
import com.clonemovie.Cinemaproject.repository.jpa.JpaReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final JpaReservationRepository jpaReservationRepository;
    private final StringRedisTemplate stringRedisTemplate;
    private static final String SEAT_STATUS_KEY_FORMAT = "movie:%s:cinema:%s:screen:%s:showdate:%s:showtime:%s";

    // 좌석 상태 조회
    public Map<String, String> getSeatStatus(String movieId, String cinemaName, String screenName, String showDate, String showTime) {
        String redisKey = String.format(SEAT_STATUS_KEY_FORMAT, movieId, cinemaName, screenName, showDate, showTime);

        // Redis에서 선택 중인 좌석 상태 확인
        Map<Object, Object> redisMap = stringRedisTemplate.opsForHash().entries(redisKey);
        Map<String, String> seatStatusMap = redisMap.entrySet().stream()
                .collect(Collectors.toMap(
                        entry -> String.valueOf(entry.getKey()),
                        entry -> String.valueOf(entry.getValue())
                ));

        // MySQL에서 이미 예약된 좌석 정보 확인
        List<Reservation> reservations = jpaReservationRepository.findByMovieIdAndCinemaNameAndScreenNameAndShowDateAndShowTime(movieId, cinemaName, screenName, showDate, showTime);

        // MySQL에서 조회된 예약 좌석을 상태에 추가
        reservations.forEach(reservation -> seatStatusMap.put(reservation.getSeatNumber(), "1")); // 1: 예약 완료

        return seatStatusMap;
    }

    // 상영 시간별 예약된 좌석 정보 조회 (MySQL + Redis)
    public List<ReservedSeatsResponse> getReservedSeatsByShowtimes(String movieId, String cinemaName, String showDate) {
        // DB에서 상영관과 상영 시간별로 예약된 좌석 수 조회
        List<Object[]> reservedSeatsData = jpaReservationRepository.findReservedSeatsGroupedByScreenAndTime(movieId, cinemaName, showDate);
        List<ReservedSeatsResponse> reservedSeatsResponseList = new ArrayList<>();

        // 데이터 순회하며 예약 정보와 Redis 데이터를 합산
        for (Object[] row : reservedSeatsData) {
            String screenName = (String) row[0];   // 상영관 ID
            String showTime = (String) row[2];   // 상영 시간
            Long reservedSeatCountInMySQL = (Long) row[3]; // MySQL에서 예약된 좌석 수

            // Redis에서 현재 선택 중인 좌석 수 조회
            int reservedSeatCountInRedis = getReservedSeatsFromRedis(movieId, cinemaName, screenName, showDate, showTime);

            // MySQL과 Redis에서 예약된 좌석 수의 총합 계산
            Long totalReservedSeats = reservedSeatCountInMySQL + reservedSeatCountInRedis;

            reservedSeatsResponseList.add(new ReservedSeatsResponse(screenName, showTime, totalReservedSeats));
        }

        return reservedSeatsResponseList;
    }

    // Redis에서 현재 선택 중인 좌석 수 조회
    private int getReservedSeatsFromRedis(String movieId, String cinemaName, String screenName, String showDate, String showTime) {
        String redisKey = String.format(SEAT_STATUS_KEY_FORMAT, movieId, cinemaName, screenName, showDate, showTime);
        Map<Object, Object> redisSeats = stringRedisTemplate.opsForHash().entries(redisKey);
        return (int) redisSeats.values().stream().filter(status -> "2".equals(status)).count(); // 상태가 '2'인 좌석 개수 반환
    }

    // 좌석 예약 처리
    public boolean reserveSeats(ReservationDto reservationDto) {
        String redisKey = String.format(SEAT_STATUS_KEY_FORMAT, reservationDto.getMovieId(), reservationDto.getCinemaName(), reservationDto.getScreenName(), reservationDto.getShowDate(), reservationDto.getShowTime());

        List<String> seatNumbers = reservationDto.getSeatNumbers();
        if (seatNumbers == null || seatNumbers.isEmpty()) {
            throw new IllegalArgumentException("좌석 목록이 비어 있습니다.");
        }

        // MySQL에서 이미 예약된 좌석 확인
        List<Reservation> reservedSeats = jpaReservationRepository.findByMovieIdAndCinemaNameAndScreenNameAndShowDateAndShowTime(
                reservationDto.getMovieId(), reservationDto.getCinemaName(), reservationDto.getScreenName(), reservationDto.getShowDate(), reservationDto.getShowTime());

        // 좌석 상태 확인 및 처리
        for (String seatNumber : seatNumbers) {
            if (isSeatReserved(reservedSeats, redisKey, seatNumber)) {
                return false; // 이미 예약된 좌석이므로 실패
            }
            stringRedisTemplate.opsForHash().put(redisKey, seatNumber, "2"); // 선택 중 상태로 변경 (2)
        }

        stringRedisTemplate.expire(redisKey, 3, TimeUnit.MINUTES); // TTL 설정 (3분 유지)
        return true;
    }

    // 좌석 예약 여부 확인
    private boolean isSeatReserved(List<Reservation> reservedSeats, String redisKey, String seatNumber) {
        // MySQL에서 예약 확인
        if (reservedSeats.stream().anyMatch(reserved -> reserved.getSeatNumber().equals(seatNumber))) {
            return true;
        }

        // Redis에서 상태 확인
        String seatStatus = (String) stringRedisTemplate.opsForHash().get(redisKey, seatNumber);
        return "1".equals(seatStatus) || "2".equals(seatStatus); // 1: 예약, 2: 선택 중
    }

    // 결제 후 좌석 확정
    public void confirmReservation(ReservationDto reservationDto) {
        String redisKey = String.format(SEAT_STATUS_KEY_FORMAT, reservationDto.getMovieId(), reservationDto.getCinemaName(), reservationDto.getScreenName(), reservationDto.getShowDate(), reservationDto.getShowTime());

        reservationDto.getSeatNumbers().forEach(seatNumber -> {
            stringRedisTemplate.opsForHash().put(redisKey, seatNumber, "1"); // 확정된 좌석으로 변경
            jpaReservationRepository.save(createReservation(reservationDto, seatNumber)); // 예약 정보 저장
        });
    }

    //예약 정보 생성
    private Reservation createReservation(ReservationDto reservationDto, String seatNumber) {
        System.out.println("merchantUid: " + reservationDto.getPaymentRequest().getMerchantUid());
        System.out.println("impUid: " + reservationDto.getPaymentRequest().getImpUid()); // 디버깅 로그
        Reservation reservation = new Reservation();
        reservation.setUserId(reservationDto.getUserId());
        reservation.setMovieId(reservationDto.getMovieId());
        reservation.setCinemaName(reservationDto.getCinemaName());
        reservation.setScreenName(reservationDto.getScreenName());
        reservation.setShowDate(reservationDto.getShowDate());
        reservation.setShowTime(reservationDto.getShowTime());
        reservation.setSeatNumber(seatNumber);
        reservation.setPaymentStatus("CONFIRMED");

        reservation.setImpUid(reservationDto.getPaymentRequest().getImpUid());
        reservation.setMerchantUid(reservationDto.getPaymentRequest().getMerchantUid());

        return reservation;
    }

    // 좌석 선택 취소 처리
    public void cancelSeatSelection(ReservationDto reservationDto) {
        String redisKey = String.format(SEAT_STATUS_KEY_FORMAT, reservationDto.getMovieId(), reservationDto.getCinemaName(), reservationDto.getScreenName(), reservationDto.getShowDate(), reservationDto.getShowTime());
        reservationDto.getSeatNumbers().forEach(seatNumber -> stringRedisTemplate.opsForHash().put(redisKey, seatNumber, "0")); // 예약 가능 상태로 변경
    }
}


