package com.clonemovie.Cinemaproject.controller;

import jakarta.persistence.Cacheable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/redis")
public class RedisController {
    private static final Logger logger = LoggerFactory.getLogger(RedisController.class);

    @GetMapping()
//    @Cacheable(value = "user")
    public String get(@RequestParam(value = "id") String id) {
        logger.info("get user - userId:{}", id);
        try {
            Thread.sleep(1500);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
        return id;
    }

    @DeleteMapping()
    @CacheEvict(value = "user")
    public void delete(@RequestParam(value = "id") String id) {
        logger.info("delete user - userId:{}", id);
    }

}
