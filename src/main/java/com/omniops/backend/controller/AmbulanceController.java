package com.omniops.backend.controller;

import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ambulances")
@CrossOrigin(origins = "*") 
public class AmbulanceController {

    @GetMapping
    public List<Map<String, Object>> getAllAmbulances() {
        List<Map<String, Object>> ambulances = new ArrayList<>();
        
        Map<String, Object> amb1 = new HashMap<>();
        amb1.put("id", 1);
        amb1.put("vehicleNumber", "UP14-AB-1001");
        amb1.put("driverName", "Ramesh Kumar");
        amb1.put("status", "AVAILABLE");
        amb1.put("currentLatitude", 28.6600);
        amb1.put("currentLongitude", 77.4200);

        ambulances.add(amb1);
        return ambulances;
    }
}