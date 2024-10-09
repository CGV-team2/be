package com.clonemovie.Cinemaproject.repository.jpa;

import com.clonemovie.Cinemaproject.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUserId(String userId);
}
