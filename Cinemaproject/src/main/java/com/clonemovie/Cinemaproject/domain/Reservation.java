package com.clonemovie.Cinemaproject.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.redis.core.RedisHash;


@RedisHash(value = "Reservation")
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;
    private String movieId;
    private String cinemaName;
    private String screenName;
    private String showDate;
    private String showTime;
    private String seatNumber;
    private String merchantUid;
    private String impUid;
    private String paymentStatus;
}
