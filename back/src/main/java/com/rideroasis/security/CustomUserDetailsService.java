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
        java.util.Optional<User> user = userRepository.findByEmail(emailOrUsername);

        if (user.isEmpty()) {
            user = userRepository.findByUsername(emailOrUsername);
        }

        return user.orElseThrow(() -> new UsernameNotFoundException("User not found: " + emailOrUsername));
    }
}
