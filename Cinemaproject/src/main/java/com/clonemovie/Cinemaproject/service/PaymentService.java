package com.clonemovie.Cinemaproject.service;

import com.clonemovie.Cinemaproject.dto.ReservationDto;
import com.siot.IamportRestClient.IamportClient;
import com.siot.IamportRestClient.exception.IamportResponseException;
import com.siot.IamportRestClient.response.IamportResponse;
import com.siot.IamportRestClient.response.Payment;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final IamportClient iamportClient;
    private final ReservationService reservationService;

    /**
     * 결제 처리 메서드
     * @param paymentRequest 결제 요청 DTO
     * @param reservationDto 예약 관련 정보 DTO
     * @return 결제 성공 여부
     */
    public boolean processPayment(ReservationDto.PaymentRequest paymentRequest, ReservationDto reservationDto) {
        try {
            // 아임포트로부터 결제 상태를 조회
            IamportResponse<Payment> paymentResponse = iamportClient.paymentByImpUid(paymentRequest.getImpUid());

            if (paymentResponse != null && "paid".equals(paymentResponse.getResponse().getStatus())) {
                // 결제 성공 시 좌석 확정
                reservationService.confirmReservation(reservationDto);
                return true;
            } else {
                // 결제 실패 시 좌석 선택 취소
                reservationService.cancelSeatSelection(reservationDto);
                return false;
            }

        } catch (IamportResponseException e) {
            // 아임포트 API 관련 예외 처리
            System.err.println("IamportResponseException 발생: " + e.getMessage());
            e.printStackTrace();
            reservationService.cancelSeatSelection(reservationDto);
            return false;

        } catch (IOException e) {
            // 네트워크 관련 예외 처리
            System.err.println("IOException 발생: " + e.getMessage());
            e.printStackTrace();
            reservationService.cancelSeatSelection(reservationDto);
            return false;
        }
    }
}
