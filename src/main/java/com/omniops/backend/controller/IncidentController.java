package com.omniops.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.omniops.backend.model.Incident;
import com.omniops.backend.repository.IncidentRepository;
import com.omniops.backend.service.DispatchService;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = "*")
public class IncidentController {

    @Autowired
    private DispatchService dispatchService;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // 1. Get all incidents for Command Dashboard

    @GetMapping
    public List<Incident> getAllIncidents() {
        return incidentRepository.findAll();
    }

    // 2. Trigger new emergency incident (AI / SOS / Manual Call)
    @PostMapping("/trigger")
    public ResponseEntity<Incident> triggerEmergency(@RequestBody Incident incident) {
        // Haversine Dispatch Algorithm run
        Incident processedIncident = dispatchService.processEmergencyIncident(incident);

        // Real-time WebSocket Alert command send to center
        messagingTemplate.convertAndSend("/topic/alerts", processedIncident);

        return ResponseEntity.ok(processedIncident);
    }
}