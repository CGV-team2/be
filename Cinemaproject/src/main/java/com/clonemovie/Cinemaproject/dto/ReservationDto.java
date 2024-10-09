package com.clonemovie.Cinemaproject.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDto {

    private String userId;       // 사용자 ID
    private String movieId;      // 영화 ID
    private String cinemaName;     // 영화관 ID
    private String screenName;     // 상영관 ID
    private String showDate;     // 상영 날짜 (예: "2024-09-30")
    private String showTime;   // 상영 시간 (예: "19:00")
    private List<String> seatNumbers; // 예약하려는 좌석 번호 목록
    private PaymentRequest paymentRequest;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentRequest {
        private String impUid;   // 아임포트 결제 ID
        private String merchantUid; // 상점 고유 주문번호
    }

    @Data
    @AllArgsConstructor
    public static class ReservedSeatsResponse {
        private String screenName;         // 상영관 ID
        private String showTime;         // 상영 시간
        private Long reservedSeatsCount; // 예약된 좌석 수
    }
}
