package com.clonemovie.Cinemaproject.repository.jpa;

import com.clonemovie.Cinemaproject.domain.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface JpaReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByMovieIdAndCinemaNameAndScreenNameAndShowDateAndShowTime(String movieId, String cinemaName, String screenName, String showDate, String showTime);

    @Query("SELECT r.screenName, r.showDate, r.showTime, COUNT(r) " +
            "FROM Reservation r " +
            "WHERE r.movieId = :movieId AND r.cinemaName = :cinemaName AND r.showDate = :showDate " +
            "GROUP BY r.screenName, r.showTime")
    List<Object[]> findReservedSeatsGroupedByScreenAndTime(String movieId, String cinemaName, String showDate);
}
