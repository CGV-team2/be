package com.clonemovie.Cinemaproject.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Configuration
@EnableJpaRepositories(basePackages = "com.clonemovie.Cinemaproject.repository.jpa")
public class JpaConfig {
}
