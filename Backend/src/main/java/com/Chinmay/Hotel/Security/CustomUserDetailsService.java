package com.Chinmay.Hotel.Security;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.Chinmay.Hotel.Entity.SystemUsers;
import com.Chinmay.Hotel.Repository.SystemUsersRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final SystemUsersRepository usersRepository;

    public CustomUserDetailsService(SystemUsersRepository usersRepository) {
        this.usersRepository = usersRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        // SystemUsers user = usersRepository.findAll()
        //     .stream()
        //     .filter(u -> u.getUsername().equals(username))
        //     .findFirst()
        //     .orElseThrow(() ->
        //         new UsernameNotFoundException("User not found"));

        SystemUsers user = usersRepository.findByUsername(username)
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new User(
            user.getUsername(),
            user.getPasswordHash(),
            List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
