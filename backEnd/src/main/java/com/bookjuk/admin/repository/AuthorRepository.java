package com.bookjuk.admin.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bookjuk.admin.domain.Author;

public interface AuthorRepository extends JpaRepository<Author, Integer> {

  Author findByAuthorName(String authorName);
  
}
