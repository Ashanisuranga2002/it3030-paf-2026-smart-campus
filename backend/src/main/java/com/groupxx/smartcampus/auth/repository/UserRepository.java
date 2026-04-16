package com.groupxx.smartcampus.auth.repository;

import com.groupxx.smartcampus.auth.entity.User;
import com.groupxx.smartcampus.auth.entity.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email, Long id);
    List<User> findAllByRole(RoleType role);
}
