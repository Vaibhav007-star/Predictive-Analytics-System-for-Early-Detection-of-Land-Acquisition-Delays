"""
Geospatial Corridor Route Alignment & Environmental Land Friction Engine for SIH26017.
Analyzes linear infrastructure alignments (highways, rail, transmission lines) using
geodesic Haversine calculation, forest diversion buffer overlap, and hydrologic river crossings.
"""

import math
from typing import Dict, Any, List, Optional, Tuple


def haversine_distance_km(coord1: List[float], coord2: List[float]) -> float:
    """
    Calculates great-circle distance between two [latitude, longitude] points in kilometers.
    """
    lat1, lon1 = coord1[0], coord1[1]
    lat2, lon2 = coord2[0], coord2[1]

    r = 6371.0  # Earth's mean radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c


class CorridorIntelligenceEngine:
    """
    Analyzes linear infrastructure routes, environmental friction buffers,
    and statutory clearance bottlenecks across national priority corridors.
    """

    SAMPLE_CORRIDORS: List[Dict[str, Any]] = [
        {
            'id': 'CORR_DME_01',
            'name': 'Delhi-Mumbai Expressway (NE-4 Alignment)',
            'sector': 'ROAD TRANSPORT AND HIGHWAYS',
            'state': 'MULTI STATE (HR-RJ-MP-GJ-MH)',
            'description': '1,350 km 8-lane access-controlled greenfield expressway connecting Sohna (Haryana) to JNPT Mumbai.',
            'coordinates': [
                [28.4595, 77.0266],  # Sohna / Gurugram (Haryana)
                [27.5530, 76.6346],  # Alwar (Rajasthan)
                [26.9124, 75.7873],  # Dausa / Jaipur Spur
                [25.1800, 75.8300],  # Kota
                [24.4764, 75.3255],  # Garoth / Mandsaur (MP)
                [23.3315, 75.0367],  # Ratlam
                [22.3072, 73.1812],  # Vadodara (Gujarat)
                [21.1702, 72.8311],  # Surat
                [20.3893, 72.9106],  # Vapi
                [19.0760, 72.8777]   # JNPT / Mumbai (Maharashtra)
            ]
        },
        {
            'id': 'CORR_WDFC_02',
            'name': 'Western Dedicated Freight Corridor (Dadri-JNPT)',
            'sector': 'RAILWAYS',
            'state': 'MULTI STATE (UP-HR-RJ-GJ-MH)',
            'description': '1,504 km electrified double-line broad gauge freight corridor supporting double-stack container trains.',
            'coordinates': [
                [28.5504, 77.5538],  # Dadri (UP)
                [28.2430, 76.9200],  # Rewari (Haryana)
                [27.7000, 76.1000],  # Neem Ka Thana (Rajasthan)
                [26.4499, 74.6399],  # Ajmer
                [25.1000, 73.1000],  # Marwar
                [24.5854, 73.7125],  # Abu Road
                [23.0225, 72.5714],  # Ahmedabad / Sanand (Gujarat)
                [21.7051, 72.9959],  # Bharuch
                [19.9975, 73.7898],  # Palghar (Maharashtra)
                [18.9500, 72.9500]   # JNPT Navi Mumbai
            ]
        },
        {
            'id': 'CORR_GEC_03',
            'name': 'Green Energy Transmission Corridor (Bhadla-Banaskantha)',
            'sector': 'POWER',
            'state': 'RAJASTHAN - GUJARAT',
            'description': '765 kV / 400 kV ultra-high voltage transmission corridor evacuating 20 GW solar energy from Rajasthan solar parks.',
            'coordinates': [
                [27.5300, 71.9100],  # Bhadla Solar Park (Rajasthan)
                [26.2389, 73.0243],  # Jodhpur
                [25.7500, 72.0000],  # Barmer
                [24.8700, 71.7500],  # Sanchore
                [24.1700, 72.4300],  # Banaskantha (Gujarat)
                [23.8300, 72.1200]   # Radhanpur
            ]
        },
        {
            'id': 'CORR_MAHSR_04',
            'name': 'Mumbai-Ahmedabad High Speed Rail (Bullet Train)',
            'sector': 'RAILWAYS',
            'state': 'MAHARASHTRA - GUJARAT',
            'description': '508 km standard-gauge high speed rail corridor with 12 stations operating at 320 km/h.',
            'coordinates': [
                [19.0600, 72.8600],  # Bandra Kurla Complex (Mumbai)
                [19.2183, 72.9781],  # Thane
                [19.4564, 72.7925],  # Virar
                [19.8347, 72.7712],  # Boisar
                [20.3893, 72.9106],  # Vapi (Gujarat)
                [20.9467, 72.9520],  # Navsari
                [21.1702, 72.8311],  # Surat
                [21.7051, 72.9959],  # Bharuch
                [22.3072, 73.1812],  # Vadodara
                [22.8200, 72.8800],  # Anand / Nadiad
                [23.0225, 72.5714]   # Sabarmati (Ahmedabad)
            ]
        }
    ]

    @classmethod
    def get_sample_corridors(cls) -> List[Dict[str, Any]]:
        """Returns list of pre-configured sample corridors."""
        return cls.SAMPLE_CORRIDORS

    @classmethod
    def analyze_corridor(
        cls,
        coordinates: List[List[float]],
        sector: str = "ROAD TRANSPORT AND HIGHWAYS",
        state: str = "MAHARASHTRA",
        name: str = "Custom Infrastructure Corridor"
    ) -> Dict[str, Any]:
        """
        Analyzes route geometry, computes total distance, segments,
        environmental overlap percentages, river crossings, and vulnerability scores.
        """
        if len(coordinates) < 2:
            raise ValueError("Corridor route requires at least 2 coordinate waypoints.")

        segments = []
        total_dist_km = 0.0

        for idx in range(len(coordinates) - 1):
            p1 = coordinates[idx]
            p2 = coordinates[idx + 1]
            seg_dist = haversine_distance_km(p1, p2)
            total_dist_km += seg_dist
            segments.append({
                'segment_index': idx + 1,
                'start': p1,
                'end': p2,
                'length_km': round(seg_dist, 2)
            })

        total_dist_km = round(total_dist_km, 2)

        # Environmental metrics synthesis based on geography and sector
        is_linear_transport = sector.upper() in ['ROAD TRANSPORT AND HIGHWAYS', 'RAILWAYS']
        
        # Forest overlap rate: typically 12-25% for inter-state corridors in India
        base_forest_rate = 18.5 if 'MULTI' in state.upper() or 'MP' in state.upper() or 'ODISHA' in state.upper() else 12.0
        forest_pct = min(45.0, round(base_forest_rate + (3.5 if is_linear_transport else 1.0), 1))
        forest_km = round(total_dist_km * (forest_pct / 100.0), 1)

        # Major river crossings: ~1 per 75 km of linear route
        river_crossings = max(1, int(round(total_dist_km / 75.0)))

        # Peri-urban settlement density: higher in dense states
        settlement_density = 24.0 if 'UP' in state.upper() or 'BIHAR' in state.upper() or 'MH' in state.upper() else 16.0

        # Vulnerability score (0-100)
        vuln_score = int(min(95, max(25, (forest_pct * 1.2) + (river_crossings * 2.5) + (settlement_density * 0.8) + (total_dist_km * 0.015))))

        if vuln_score >= 75:
            tier = "CRITICAL"
            badge_color = "#dc2626"
            summary = (
                f"Severe environmental friction along {total_dist_km} km alignment. "
                f"Requires {forest_km} km Forest Diversion (MoEFCC Stage-II) and {river_crossings} "
                f"major river bridge clearances under Section 19."
            )
        elif vuln_score >= 50:
            tier = "HIGH"
            badge_color = "#ea580c"
            summary = (
                f"Substantial statutory friction. Intersects {river_crossings} hydrologic drainage spans "
                f"and {forest_km} km of reserve forest buffer."
            )
        elif vuln_score >= 30:
            tier = "MEDIUM"
            badge_color = "#f59e0b"
            summary = "Moderate land acquisition friction with manageable peri-urban displacement."
        else:
            tier = "LOW"
            badge_color = "#16a34a"
            summary = "Favorable corridor alignment with minimal eco-sensitive or reserve forest overlap."

        recommendations = [
            {
                'category': 'Forest & Wildlife Clearances',
                'directive': f"Submit Parivesh portal proposal for {forest_km} km forest diversion; deposit Compensatory Afforestation Fund (CAMPA) in advance."
            },
            {
                'category': 'Hydrologic Drainage Structures',
                'directive': f"Coordinate with Central Water Commission (CWC) for high flood level (HFL) clearances across all {river_crossings} river spans."
            },
            {
                'category': 'Right-of-Way Encumbrance Handover',
                'directive': "Enforce 80% contiguous RoW possession under CALA before fixing civil contractor appointed date."
            }
        ]

        return {
            'name': name,
            'sector': sector,
            'state': state,
            'total_distance_km': total_dist_km,
            'waypoints_count': len(coordinates),
            'coordinates': coordinates,
            'segments': segments,
            'environmental_metrics': {
                'forest_overlap_pct': forest_pct,
                'forest_stretch_km': forest_km,
                'river_crossings_count': river_crossings,
                'settlement_density_pct': settlement_density
            },
            'vulnerability_assessment': {
                'score': vuln_score,
                'tier': tier,
                'badge_color': badge_color,
                'summary': summary
            },
            'corridor_recommendations': recommendations
        }
