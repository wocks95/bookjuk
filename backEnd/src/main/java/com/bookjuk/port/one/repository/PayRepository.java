package com.bookjuk.port.one.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.bookjuk.port.one.domain.Pay;

public interface PayRepository extends JpaRepository<Pay, Integer> {
}
