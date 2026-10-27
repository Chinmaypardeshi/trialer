package com.Chinmay.Hotel.Repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Chinmay.Hotel.Entity.SystemUsers;
import java.util.Optional;

public interface SystemUsersRepository extends JpaRepository<SystemUsers,Integer >{

    // In SystemUsersRepository.java
Optional<SystemUsers> findByUsername(String username);
    
}
