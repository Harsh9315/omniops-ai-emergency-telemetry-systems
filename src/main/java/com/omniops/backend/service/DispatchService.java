package com.omniops.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.omniops.backend.model.Ambulance;
import com.omniops.backend.model.Hospital;
import com.omniops.backend.model.Incident;
import com.omniops.backend.repository.AmbulanceRepository;
import com.omniops.backend.repository.HospitalRepository;
import com.omniops.backend.repository.IncidentRepository;

@Service
public class DispatchService {

    @Autowired
    private HospitalRepository hospitalRepository;

    @Autowired
    private AmbulanceRepository ambulanceRepository;

    @Autowired
    private IncidentRepository incidentRepository;

    
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_KM = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_KM * c;
    }

    
    public Incident processEmergencyIncident(Incident incident) {
        
        List<Hospital> availableHospitals = hospitalRepository.findHospitalsWithAvailableIcuBeds();
        Hospital nearestHospital = null;
        double minHospitalDistance = Double.MAX_VALUE;

        for (Hospital hospital : availableHospitals) {
            double distance = calculateDistance(incident.getLatitude(), incident.getLongitude(),
                                                hospital.getLatitude(), hospital.getLongitude());
            if (distance < minHospitalDistance) {
                minHospitalDistance = distance;
                nearestHospital = hospital;
            }
        }

        
        List<Ambulance> availableAmbulances = ambulanceRepository.findByStatus("AVAILABLE");
        Ambulance nearestAmbulance = null;
        double minAmbulanceDistance = Double.MAX_VALUE;

        for (Ambulance ambulance : availableAmbulances) {
            double distance = calculateDistance(incident.getLatitude(), incident.getLongitude(),
                                                ambulance.getCurrentLatitude(), ambulance.getCurrentLongitude());
            if (distance < minAmbulanceDistance) {
                minAmbulanceDistance = distance;
                nearestAmbulance = ambulance;
            }
        }

        if (nearestHospital != null && nearestAmbulance != null) {
            incident.setAssignedHospital(nearestHospital);
            incident.setAssignedAmbulance(nearestAmbulance);
            incident.setStatus("DISPATCHED");

           
            nearestAmbulance.setStatus("DISPATCHED");
            ambulanceRepository.save(nearestAmbulance);

            
            nearestHospital.setAvailableIcuBeds(nearestHospital.getAvailableIcuBeds() - 1);
            hospitalRepository.save(nearestHospital);
        } else {
            incident.setStatus("REPORTED");
        }

        return incidentRepository.save(incident);
    }
}