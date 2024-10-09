package com.clonemovie.Cinemaproject.repository.redis;

import com.clonemovie.Cinemaproject.domain.Reservation;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository("redisReservationRepository")
public interface RedisReservationRepository extends CrudRepository<Reservation, Long> {
}