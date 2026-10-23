package com.omniops.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Incident {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String source; // AI_CCTV, CITIZEN_SOS, MANUAL_CALL

    private String severity; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private String status; // REPORTED, CONFIRMED, DISPATCHED, RESOLVED, DISMISSED

    @ManyToOne
    @JoinColumn(name = "assigned_hospital_id")
    private Hospital assignedHospital;

    @ManyToOne
    @JoinColumn(name = "assigned_ambulance_id")
    private Ambulance assignedAmbulance;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}