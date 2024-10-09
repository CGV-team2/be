package com.clonemovie.Cinemaproject.controller;

import com.clonemovie.Cinemaproject.dto.ReservationDto;
import com.clonemovie.Cinemaproject.dto.ReservationDto.ReservedSeatsResponse;
import com.clonemovie.Cinemaproject.service.JwtUtility;
import com.clonemovie.Cinemaproject.service.PaymentService;
import com.clonemovie.Cinemaproject.service.ReservationService;
import com.clonemovie.Cinemaproject.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservation")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final UserService userservice;
    private final JwtUtility jwtUtility;
    private final PaymentService paymentService;

    // 좌석 예약 요청 처리
    @PostMapping("/reserve")
    public ResponseEntity<String> reserveSeats(@RequestBody ReservationDto reservationDto, HttpServletRequest request) {
        String token = userservice.extractTokenFromRequest(request);
        String userId = jwtUtility.validateToken(token).getSubject();
        reservationDto.setUserId(userId);

        boolean isReserved = reservationService.reserveSeats(reservationDto);
        return isReserved ? ResponseEntity.ok("좌석이 성공적으로 선택되었습니다.") : ResponseEntity.status(409).body("선택한 좌석이 이미 예약되었습니다.");
    }


    // 좌석 상태 조회
//    @GetMapping("/seat-status")
//    public ResponseEntity<Map<String, String>> getSeatStatus(@RequestParam String movieId, @RequestParam String cinemaName, @RequestParam String screenName, @RequestParam String showDate, @RequestParam String showTime) {
//        Map<String, String> seatStatus = reservationService.getSeatStatus(movieId, cinemaName, screenName, showDate, showTime);
//        return seatStatus.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(seatStatus);
//    }
    @GetMapping("/seat-status")
    public ResponseEntity<Map<String, String>> getSeatStatus(
            @RequestParam String movieId,
            @RequestParam String cinemaName,
            @RequestParam String screenName,
            @RequestParam String showDate,
            @RequestParam String showTime
    ) {
        // 영화 제목을 디코딩
        String decodedMovieId = URLDecoder.decode(movieId, StandardCharsets.UTF_8);
        String decodedCinemaName = URLDecoder.decode(cinemaName, StandardCharsets.UTF_8);
        String decodedScreenName = URLDecoder.decode(screenName, StandardCharsets.UTF_8);
        String decodedShowDate = URLDecoder.decode(showDate, StandardCharsets.UTF_8);
        String decodedShowTime = URLDecoder.decode(showTime, StandardCharsets.UTF_8);

        // 디코딩된 값을 서비스로 전달하여 좌석 상태 조회
        Map<String, String> seatStatus = reservationService.getSeatStatus(
                decodedMovieId, decodedCinemaName, decodedScreenName, decodedShowDate, decodedShowTime
        );

        return seatStatus.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(seatStatus);
    }



    // 상영 시간별 예약된 좌석 수 조회
    @GetMapping("/reserved-seats")
    public ResponseEntity<List<ReservedSeatsResponse>> getReservedSeats(@RequestParam String movieId, @RequestParam String cinemaName, @RequestParam String showDate) {
        List<ReservedSeatsResponse> reservedSeats = reservationService.getReservedSeatsByShowtimes(movieId, cinemaName, showDate);
        return ResponseEntity.ok(reservedSeats);
    }
    // 결제 처리 요청
    @PostMapping("/pay")
    public ResponseEntity<String> processPayment(@RequestBody ReservationDto reservationDto, HttpServletRequest request) {

        String token = userservice.extractTokenFromRequest(request);
        String userId = jwtUtility.validateToken(token).getSubject();
        reservationDto.setUserId(userId);

        boolean isPaymentSuccess = paymentService.processPayment(reservationDto.getPaymentRequest(), reservationDto);


        return isPaymentSuccess ? ResponseEntity.ok("결제가 성공적으로 완료되었습니다.") : ResponseEntity.status(402).body("결제 실패");
    }

}
