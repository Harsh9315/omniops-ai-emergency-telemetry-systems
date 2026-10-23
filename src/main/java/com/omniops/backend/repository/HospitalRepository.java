package com.omniops.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.omniops.backend.model.Hospital;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    
    @Query("SELECT h FROM Hospital h WHERE h.availableIcuBeds > 0")
    List<Hospital> findHospitalsWithAvailableIcuBeds();
}