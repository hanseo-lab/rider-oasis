package com.rideroasis.security;

import com.rideroasis.entity.User;
import com.rideroasis.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String emailOrUsername) throws UsernameNotFoundException {
        // 癒쇱? email濡??쒕룄
        java.util.Optional<User> user = userRepository.findByEmail(emailOrUsername);
        
        // email濡?李얠? 紐삵븯硫?username?쇰줈 ?쒕룄
        if (user.isEmpty()) {
            user = userRepository.findByUsername(emailOrUsername);
        }
        
        return user.orElseThrow(() -> 
            new UsernameNotFoundException("?대떦 ?대찓???ъ슜?먮챸??媛吏??ъ슜?먮? 李얠쓣 ???놁뒿?덈떎: " + emailOrUsername));
    }
}


