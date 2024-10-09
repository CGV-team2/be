package com.clonemovie.Cinemaproject.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@NoArgsConstructor
@Getter
@Entity
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String userId;

    private String name;
    private String birthDate;
    private String password;

    private static final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User(String name, String birthDate, String  userId, String password) {
        this.name = name;
        this.birthDate = birthDate;
        this.userId = userId;
        this.setPassword(password);
    }

    public void setPassword(String password) {this.password = passwordEncoding(password);}

    public String passwordEncoding (String password) {
        return passwordEncoder.encode(password);
    }


    public boolean checkPassword(String rawPassword) {return passwordEncoder.matches(rawPassword,this.password);}
}
