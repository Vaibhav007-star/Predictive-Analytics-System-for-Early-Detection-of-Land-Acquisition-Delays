"""
Official Geographic Coordinates for Indian States & Union Territories.
STRICT RULE: Only authentic state centroids are used.
Precision is explicitly labeled as 'State-level centroid' to prevent fabricating precise GPS coordinates.
"""

from typing import Dict, Any, Optional

# Verified administrative centroids for Indian States and Union Territories
STATE_CENTROIDS: Dict[str, Dict[str, Any]] = {
    'ANDAMAN AND NICOBAR ISLANDS': {'lat': 11.7401, 'lng': 92.6586, 'precision': 'State-level centroid'},
    'ANDHRA PRADESH': {'lat': 15.9129, 'lng': 79.7400, 'precision': 'State-level centroid'},
    'ARUNACHAL PRADESH': {'lat': 28.2180, 'lng': 94.7278, 'precision': 'State-level centroid'},
    'ASSAM': {'lat': 26.2006, 'lng': 92.9376, 'precision': 'State-level centroid'},
    'BIHAR': {'lat': 25.0961, 'lng': 85.3131, 'precision': 'State-level centroid'},
    'CHHATTISGARH': {'lat': 21.2787, 'lng': 81.8661, 'precision': 'State-level centroid'},
    'DELHI': {'lat': 28.7041, 'lng': 77.1025, 'precision': 'State-level centroid'},
    'GOA': {'lat': 15.2993, 'lng': 74.1240, 'precision': 'State-level centroid'},
    'GUJARAT': {'lat': 22.2587, 'lng': 71.1924, 'precision': 'State-level centroid'},
    'HARYANA': {'lat': 29.0588, 'lng': 76.0856, 'precision': 'State-level centroid'},
    'HIMACHAL PRADESH': {'lat': 31.1048, 'lng': 77.1734, 'precision': 'State-level centroid'},
    'JAMMU AND KASHMIR': {'lat': 33.7782, 'lng': 76.5762, 'precision': 'State-level centroid'},
    'JHARKHAND': {'lat': 23.6102, 'lng': 85.2799, 'precision': 'State-level centroid'},
    'KARNATAKA': {'lat': 15.3173, 'lng': 75.7139, 'precision': 'State-level centroid'},
    'KERALA': {'lat': 10.8505, 'lng': 76.2711, 'precision': 'State-level centroid'},
    'LADAKH': {'lat': 34.1526, 'lng': 77.5771, 'precision': 'State-level centroid'},
    'MADHYA PRADESH': {'lat': 22.9734, 'lng': 78.6569, 'precision': 'State-level centroid'},
    'MAHARASHTRA': {'lat': 19.7515, 'lng': 75.7139, 'precision': 'State-level centroid'},
    'MANIPUR': {'lat': 24.6637, 'lng': 93.9063, 'precision': 'State-level centroid'},
    'MEGHALAYA': {'lat': 25.4670, 'lng': 91.3662, 'precision': 'State-level centroid'},
    'MIZORAM': {'lat': 23.1645, 'lng': 92.9376, 'precision': 'State-level centroid'},
    'MULTI STATE': {'lat': 20.5937, 'lng': 78.9629, 'precision': 'National centroid (Multi-State)'},
    'NAGALAND': {'lat': 26.1584, 'lng': 94.5624, 'precision': 'State-level centroid'},
    'ODISHA': {'lat': 20.9517, 'lng': 85.0985, 'precision': 'State-level centroid'},
    'PUNJAB': {'lat': 31.1471, 'lng': 75.3412, 'precision': 'State-level centroid'},
    'RAJASTHAN': {'lat': 27.0238, 'lng': 74.2179, 'precision': 'State-level centroid'},
    'SIKKIM': {'lat': 27.5330, 'lng': 88.5122, 'precision': 'State-level centroid'},
    'TAMIL NADU': {'lat': 11.1271, 'lng': 78.6569, 'precision': 'State-level centroid'},
    'TELANGANA': {'lat': 18.1124, 'lng': 79.0193, 'precision': 'State-level centroid'},
    'TRIPURA': {'lat': 23.9408, 'lng': 91.9882, 'precision': 'State-level centroid'},
    'UTTAR PRADESH': {'lat': 26.8467, 'lng': 80.9462, 'precision': 'State-level centroid'},
    'UTTARAKHAND': {'lat': 30.0668, 'lng': 79.0193, 'precision': 'State-level centroid'},
    'WEST BENGAL': {'lat': 22.9868, 'lng': 87.8550, 'precision': 'State-level centroid'}
}

def get_state_coords(state_name: str) -> Optional[Dict[str, Any]]:
    """Returns official centroid and precision metadata for an Indian state."""
    clean = state_name.strip().upper()
    return STATE_CENTROIDS.get(clean, {
        'lat': 20.5937,
        'lng': 78.9629,
        'precision': 'National centroid (Fallback)'
    })

